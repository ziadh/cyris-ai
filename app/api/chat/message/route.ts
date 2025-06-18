import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Chat } from '@/models/Chat';
import { getBestModel } from '@/lib/ai';
import { parseRoutePrompt } from '@/lib/utils';
import OpenAI from "openai";
import { AI_MODELS, FORWARDED_RESPONSE_SYSTEM_PROMPT } from '@/lib/constants';

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

    const { chatId, messageContent, selectedModel } = await request.json();

    console.log(`🔍 [${requestId}] Request received:`, { chatId, messageContent, selectedModel });
    await connectToDatabase();

    const chat = await Chat.findOne({ id: chatId, userId: session.user.id });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Add user message to chat
    chat.messages.push({ role: 'user', content: messageContent });

    let assistantMessageContent: string;
    let modelId: string | undefined;

    if (selectedModel === "autopick") {
      // Use the existing autopick logic
      console.log(`🤖 [${requestId}] Using autopick - calling router model`);
      
      const routerResponse = await getBestModel(messageContent, requestId);
      console.log(`🔄 [${requestId}] Router response:`, routerResponse);
      
      const routeInfo = parseRoutePrompt(routerResponse || '');
      console.log('📋 Route info:', JSON.stringify(routeInfo, null, 2));

      console.log('🔍 Checking routing conditions:');
      console.log('  - routeInfo.isRouting:', routeInfo.isRouting);
      console.log('  - routeInfo.model:', routeInfo.model);
      console.log('  - Both truthy?', routeInfo.isRouting && routeInfo.model);

      if (routeInfo.isRouting && routeInfo.model) {
        modelId = routeInfo.model;
        console.log('✅ Routing to model:', modelId);
        
        // Call the target model with HTML formatting system prompt
        const targetModelResponse = await openai.chat.completions.create({
          model: modelId as string,
          messages: [
            { role: 'system', content: FORWARDED_RESPONSE_SYSTEM_PROMPT },
            { role: 'user', content: routeInfo.prompt }
          ],
        });
        assistantMessageContent = targetModelResponse.choices[0].message.content || 'Error getting response from model.';
        console.log('📝 Target model response received, length:', assistantMessageContent.length);
      } else {
        // If router didn't route or returned an invalid model, use its response as the assistant message
        assistantMessageContent = routerResponse || 'Error getting response from router model.';
        console.log('❌ No routing occurred, using router response directly');
      }
    } else {
      // Direct model selection - call the specific model directly
      console.log(`🎯 [${requestId}] Direct model selection:`, selectedModel);
      
      // Validate that the selected model exists in our AI_MODELS list
      const modelExists = AI_MODELS.find(model => model.id === selectedModel);
      if (!modelExists) {
        console.error(`❌ [${requestId}] Invalid model selected:`, selectedModel);
        return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
      }

      modelId = selectedModel;
      
      if (selectedModel === "openai/gpt-image-1") {
        // Handle image generation through the generate-image route
        console.log(`🎨 [${requestId}] Image generation request`);
        
        try {
          // Get BYOK API key from request headers
          const byokApiKey = request.headers.get('x-byok-api-key');
          
          if (!byokApiKey) {
            assistantMessageContent = `Error: OpenAI API key is required for image generation. Please configure your API key in settings.`;
          } else {
            const imageResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                prompt: messageContent,
                apiKey: byokApiKey
              }),
            });

            if (imageResponse.ok) {
              const imageResult = await imageResponse.json();
              assistantMessageContent = `![Generated Image](${imageResult.imageUrl})`;
              console.log(`🖼️ [${requestId}] Image generated successfully`);
            } else {
              const errorResult = await imageResponse.json();
              throw new Error(errorResult.error || 'Failed to generate image');
            }
          }
        } catch (error: any) {
          console.error(`❌ [${requestId}] Error generating image:`, error);
          assistantMessageContent = `Error generating image: ${error.message || 'Please try again.'}`;
        }
      } else {
        // Handle regular text models
        try {
          // Call the selected model directly with HTML formatting system prompt
          const directModelResponse = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
              { role: 'system', content: FORWARDED_RESPONSE_SYSTEM_PROMPT },
              { role: 'user', content: messageContent }
            ],
          });
          assistantMessageContent = directModelResponse.choices[0].message.content || 'Error getting response from model.';
          console.log(`📝 [${requestId}] Direct model (${selectedModel}) response received, length:`, assistantMessageContent.length);
        } catch (error) {
          console.error(`❌ [${requestId}] Error calling model ${selectedModel}:`, error);
          assistantMessageContent = `Error getting response from ${selectedModel}. Please try again.`;
        }
      }
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
