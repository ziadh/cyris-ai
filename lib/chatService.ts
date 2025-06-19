import { IMessage } from '@/models/Chat';

export interface ChatData {
  id: string;
  title: string;
  messages: IMessage[];
}

export class ChatService {
  private static LOCAL_STORAGE_KEY = 'cyrisUserChats';

  static async getChats(isAuthenticated: boolean): Promise<ChatData[]> {
    if (isAuthenticated) {
      try {
        const response = await fetch('/api/chats');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Error fetching chats from database:', error);
      }
      return [];
    } else {
      const storedChats = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (storedChats) {
        try {
          const parsedChats = JSON.parse(storedChats);
          return Array.isArray(parsedChats) ? parsedChats : [];
        } catch (error) {
          console.error('Failed to parse chats from localStorage:', error);
          localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        }
      }
      return [];
    }
  }

  static async saveChat(
    chat: ChatData,
    isAuthenticated: boolean
  ): Promise<ChatData | null> {
    if (isAuthenticated) {
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chat),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Error saving chat to database:', error);
      }
      return null;
    } else {
      const currentChats = await this.getChats(false);
      const updatedChats = [chat, ...currentChats];
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
      return chat;
    }
  }

  static async updateChat(
    chatId: string,
    messages: IMessage[],
    isAuthenticated: boolean
  ): Promise<ChatData | null> {
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Error updating chat in database:', error);
      }
      return null;
    } else {
      const currentChats = await this.getChats(false);
      const updatedChats = currentChats.map(chat =>
        chat.id === chatId ? { ...chat, messages } : chat
      );
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
      return updatedChats.find(chat => chat.id === chatId) || null;
    }
  }

  static async deleteChat(
    chatId: string,
    isAuthenticated: boolean
  ): Promise<boolean> {
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
        });
        return response.ok;
      } catch (error) {
        console.error('Error deleting chat from database:', error);
        return false;
      }
    } else {
      const currentChats = await this.getChats(false);
      const updatedChats = currentChats.filter(chat => chat.id !== chatId);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
      return true;
    }
  }

  static async migrateLocalChatsToDatabase(): Promise<void> {
    try {
      const localChats = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (!localChats) return;

      const parsedChats = JSON.parse(localChats);
      if (!Array.isArray(parsedChats) || parsedChats.length === 0) return;

      // Use the bulk migration endpoint for better performance
      const response = await fetch('/api/chats/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ localChats: parsedChats }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        console.log('Successfully migrated local chats to database:', result.message);
      } else {
        console.error('Failed to migrate chats:', response.statusText);
      }
    } catch (error) {
      console.error('Error migrating local chats to database:', error);
    }
  }
}