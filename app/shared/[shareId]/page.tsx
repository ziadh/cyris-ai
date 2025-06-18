"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ChatMessages from "@/components/ChatMessages";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import Link from "next/link";

interface SharedChat {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string; modelId?: string }>;
  sharedAt: string;
  createdAt: string;
}

export default function SharedChatPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [chat, setChat] = useState<SharedChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Set theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      setIsDarkTheme(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (shareId) {
      fetchSharedChat();
    }
  }, [shareId]);

  const fetchSharedChat = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shared/${shareId}`);
      
      if (response.ok) {
        const data = await response.json();
        setChat(data);
      } else if (response.status === 404) {
        setError("This shared chat was not found or is no longer available.");
      } else {
        setError("Failed to load shared chat.");
      }
    } catch (error) {
      console.error("Error fetching shared chat:", error);
      setError("Failed to load shared chat.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Chat Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Cyris AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Header */}
      <header className={`border-b px-4 py-3 ${
        isDarkTheme ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/icon.png"
                alt="Cyris AI"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold">Cyris AI</span>
            </Link>
            
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="hidden sm:block">
              <p className="text-sm text-gray-600 dark:text-gray-400">Shared Chat</p>
            </div>
          </div>

          {/* Right side - Theme toggle and CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              title="Toggle theme"
            >
              {isDarkTheme ? "🌞" : "🌙"}
            </button>
            
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Try Cyris AI
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        {chat && (
          <div className={`px-4 py-4 border-b ${
            isDarkTheme ? "border-gray-700" : "border-gray-200"
          }`}>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">{chat.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(chat.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Shared {formatDate(chat.sharedAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          {chat && (
            <ChatMessages
              currentMessages={chat.messages}
              forwardingMessage={null}
              loading={false}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t text-center ${
          isDarkTheme ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
        }`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            This is a shared conversation from Cyris AI
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
          >
            Start your own conversation
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
} 