
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
export const runtime = 'edge'

// Initialize OpenAI client; make sure OPENAI_API_KEY is set in your env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

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
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
