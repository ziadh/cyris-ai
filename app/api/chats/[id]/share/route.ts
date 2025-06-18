import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Chat } from '@/models/Chat';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// Create or toggle share for a chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Find the chat and verify ownership
    const chat = await Chat.findOne({ id: id, userId: session.user.id });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // If chat is already shared, return existing share link
    if (chat.isShared && chat.shareId) {
      return NextResponse.json({
        success: true,
        isShared: true,
        shareId: chat.shareId,
        shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${chat.shareId}`
      });
    }

    // Create new share
    const shareId = nanoid(12); // Generate a short, URL-safe ID
    
    const updatedChat = await Chat.findOneAndUpdate(
      { id: id, userId: session.user.id },
      { 
        isShared: true, 
        shareId: shareId,
        sharedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      isShared: true,
      shareId: shareId,
      shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${shareId}`
    });
  } catch (error) {
    console.error('Error sharing chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Unshare a chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const updatedChat = await Chat.findOneAndUpdate(
      { id: id, userId: session.user.id },
      { 
        isShared: false, 
        $unset: { shareId: 1, sharedAt: 1 }
      },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isShared: false
    });
  } catch (error) {
    console.error('Error unsharing chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 