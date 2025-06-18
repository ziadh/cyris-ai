"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ChatMessages from "@/components/ChatMessages";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Sun,
  Moon,
} from "lucide-react";
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
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
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
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
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
    <div
      className={`min-h-screen flex flex-col ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b px-4 py-3 ${
          isDarkTheme
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Shared Chat
              </p>
            </div>
          </div>

          {/* Right side - Theme toggle and CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                isDarkTheme
                  ? "hover:bg-gray-700 text-yellow-400"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
              title="Toggle theme"
            >
              {isDarkTheme ? <Sun /> : <Moon />}
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
          <div
            className={`px-4 py-4 border-b ${
              isDarkTheme ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              {chat.title}
            </h1>
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
        <div
          className={`px-4 py-3 border-t text-center ${
            isDarkTheme
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            This is a shared conversation from Cyris AI
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm mb-3"
          >
            Start your own conversation
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Developer Credits */}
          <div className="border-t pt-3 mt-3 border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Built with ❤️ by{" "}
              <a
                href="https://ziadhussein.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Ziad Hussein
              </a>
            </p>
            <div className="flex justify-center items-center gap-4 text-xs">
              <a
                href="https://github.com/ziadh/cyris-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View Source
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="https://ziadhussein.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
