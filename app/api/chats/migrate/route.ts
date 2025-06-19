import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Chat } from '@/models/Chat';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { localChats } = await request.json();

    if (!Array.isArray(localChats) || localChats.length === 0) {
      return NextResponse.json({ message: 'No chats to migrate' });
    }

    await connectToDatabase();

    const migratedChats = [];

    for (const chatData of localChats) {
      try {
        // Check if chat already exists (to avoid duplicates)
        const existingChat = await Chat.findOne({ 
          id: chatData.id, 
          userId: session.user.id 
        });

        if (!existingChat) {
          const chat = new Chat({
            id: chatData.id,
            title: chatData.title,
            messages: chatData.messages,
            userId: session.user.id,
            createdAt: new Date(chatData.createdAt || Date.now()),
            updatedAt: new Date(chatData.updatedAt || Date.now()),
          });

          await chat.save();
          migratedChats.push(chat);
        }
      } catch (error) {
        console.error('Error migrating individual chat:', error);
        // Continue with other chats even if one fails
      }
    }

    console.log(`Successfully migrated ${migratedChats.length} chats for user ${session.user.id}`);

    return NextResponse.json({ 
      message: `Successfully migrated ${migratedChats.length} chats`,
      migratedCount: migratedChats.length
    });
  } catch (error) {
    console.error('Error migrating chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 