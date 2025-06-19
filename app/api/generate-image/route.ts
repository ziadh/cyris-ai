import { NextResponse } from 'next/server'
import OpenAI from 'openai'
export const runtime = 'edge'

// Helper function to download and convert image to base64
async function downloadAndStoreImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, apiKey } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key is required for image generation. Please configure your API key in settings.' 
      }, { status: 400 })
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({ 
        error: 'Invalid OpenAI API key format. API key should start with "sk-"' 
      }, { status: 400 })
    }

    // Initialize OpenAI client with BYOK key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const res = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    })

    // Extract the generated image URL
    const temporaryImageUrl = res.data?.[0]?.url

    if (!temporaryImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    // Download and convert to base64 to prevent expiration
    console.log('Downloading and storing image to prevent expiration...')
    const permanentImageUrl = await downloadAndStoreImage(temporaryImageUrl)

    return NextResponse.json({ 
      imageUrl: permanentImageUrl,
      originalUrl: temporaryImageUrl // Keep for debugging
    })
  } catch (error: any) {
    console.error('Error generating image:', error)
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type
    })
    
    // Handle specific OpenAI API errors
    if (error?.status === 401) {
      return NextResponse.json({ 
        error: 'Invalid API key. Please check your OpenAI API key and try again.' 
      }, { status: 401 })
    }
    
    if (error?.status === 429) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 })
    }
    
    if (error?.status === 402) {
      return NextResponse.json({ 
        error: 'Insufficient quota. Please check your OpenAI account billing.' 
      }, { status: 402 })
    }

    return NextResponse.json({ 
      error: error?.message || 'Failed to generate image. Please try again.' 
    }, { status: 500 })
  }
}
