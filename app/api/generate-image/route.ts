import { NextResponse } from 'next/server'
import OpenAI from 'openai'
export const runtime = 'edge'

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
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
    })

    // Extract the generated image URL
    const imageUrl = res.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Error generating image:', error)
    
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
