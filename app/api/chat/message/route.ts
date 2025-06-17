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
  const requestId = Math.random().toString(36).substring(7);
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, messageContent } = await request.json();

    console.log(`🔍 [${requestId}] Request received:`, { chatId, messageContent });
    await connectToDatabase();

    const chat = await Chat.findOne({ id: chatId, userId: session.user.id });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Add user message to chat
    chat.messages.push({ role: 'user', content: messageContent });

    // Call the router model
    const routerResponse = await getBestModel(messageContent, requestId);
    console.log(`🔄 [${requestId}] Router response:`, routerResponse);
    
    const routeInfo = parseRoutePrompt(routerResponse || '');
    console.log('📋 Route info:', JSON.stringify(routeInfo, null, 2));

    let assistantMessageContent: string;
    let modelId: string | undefined;

    console.log('🔍 Checking routing conditions:');
    console.log('  - routeInfo.isRouting:', routeInfo.isRouting);
    console.log('  - routeInfo.model:', routeInfo.model);
    console.log('  - Both truthy?', routeInfo.isRouting && routeInfo.model);

    if (routeInfo.isRouting && routeInfo.model) {
      modelId = routeInfo.model;
      console.log('✅ Routing to model:', modelId);
      
      // Call the target model
      const targetModelResponse = await openai.chat.completions.create({
        model: modelId as string, // Type assertion
        messages: [{ role: 'user', content: routeInfo.prompt }],
      });
      assistantMessageContent = targetModelResponse.choices[0].message.content || 'Error getting response from model.';
      console.log('📝 Target model response received, length:', assistantMessageContent.length);
    } else {
      // If router didn't route or returned an invalid model, use its response as the assistant message
      assistantMessageContent = routerResponse || 'Error getting response from router model.';
      console.log('❌ No routing occurred, using router response directly');
      // No specific modelId to attach if the router didn't route or failed
    }

    console.log('🎯 Final modelId before pushing to messages:', modelId);
    
    // Add assistant message to chat
    const messageToAdd = { role: 'assistant', content: assistantMessageContent, modelId };
    console.log('💾 Message object being pushed:', JSON.stringify(messageToAdd, null, 2));
    chat.messages.push(messageToAdd);

    chat.updatedAt = new Date();
    await chat.save();
    
    console.log('💽 Chat saved to database. Last message:', JSON.stringify(chat.messages[chat.messages.length - 1], null, 2));

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
