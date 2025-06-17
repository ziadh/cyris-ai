import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Chat } from '@/models/Chat';
import { getBestModel } from '@/lib/ai';
import { parseRoutePrompt } from '@/lib/utils';
import OpenAI from "openai";
import { AI_MODELS } from '@/lib/constants';

export const runtime = 'nodejs';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.PUBLIC_API_URL,
    'X-Title': 'Cyris AI',
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, messageContent } = await request.json();

    await connectToDatabase();

    const chat = await Chat.findOne({ id: chatId, userId: session.user.id });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Add user message to chat
    chat.messages.push({ role: 'user', content: messageContent });

    // Call the router model
    const routerResponse = await getBestModel(messageContent);
    const routeInfo = parseRoutePrompt(routerResponse || '');

    let assistantMessageContent: string;
    let modelId: string | undefined;

    if (routeInfo.isRouting && routeInfo.model) {
      modelId = routeInfo.model;
      // Call the target model
      const targetModelResponse = await openai.chat.completions.create({
        model: modelId as string, // Type assertion
        messages: [{ role: 'user', content: routeInfo.prompt }],
      });
      assistantMessageContent = targetModelResponse.choices[0].message.content || 'Error getting response from model.';
    } else {
      // If router didn't route or returned an invalid model, use its response as the assistant message
      assistantMessageContent = routerResponse || 'Error getting response from router model.';
      // No specific modelId to attach if the router didn't route or failed
    }

    // Add assistant message to chat
    chat.messages.push({ role: 'assistant', content: assistantMessageContent, modelId });

    chat.updatedAt = new Date();
    await chat.save();

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
