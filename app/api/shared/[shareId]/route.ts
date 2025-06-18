import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Chat } from '@/models/Chat';

export const runtime = 'nodejs';

// Get a shared chat by shareId (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    await connectToDatabase();

    // Find the shared chat
    const chat = await Chat.findOne({ 
      shareId: shareId, 
      isShared: true 
    }).lean();

    if (!chat) {
      return NextResponse.json({ error: 'Shared chat not found' }, { status: 404 });
    }

    // Return chat data without sensitive information
    const sharedChat = {
      id: chat.id,
      title: chat.title,
      messages: chat.messages,
      sharedAt: chat.sharedAt,
      createdAt: chat.createdAt,
      // Don't expose userId or other sensitive data
    };

    return NextResponse.json(sharedChat);
  } catch (error) {
    console.error('Error fetching shared chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 