"use client";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

interface ChatSidebarProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  allChats: Array<{
    id: string;
    title: string;
    messages: Array<{ role: string; content: string }>;
  }>;
  activeChatId: string | null;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  isSidebarOpen: boolean;
}

export default function ChatSidebar({
  isDarkTheme,
  toggleTheme,
  allChats,
  activeChatId,
  handleNewChat,
  handleSelectChat,
  sidebarRef,
  isSidebarOpen,
}: ChatSidebarProps) {
  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-30 w-64 p-4 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-[20%] lg:w-[15%] border-r ${
        isDarkTheme
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-50"
      } flex flex-col h-full overflow-y-auto`}
    >
      {/* Top section: Logo and Title */}
      <div className="flex items-center mb-6">
        <Image
          src="/icon.png"
          alt="Cyris AI"
          width={32}
          height={32}
          className="rounded-lg mr-2"
        />
        <h1 className="text-2xl font-bold">Cyris AI</h1>
      </div>

      {/* Chat controls and history */}
      <div className="space-y-2 flex-grow overflow-y-auto mb-4">
        <button
          className={`w-full py-2 px-4 rounded-lg text-left ${
            isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
          } transition-colors`}
          onClick={handleNewChat}
        >
          New Chat
        </button>

        {/* History items */}
        {allChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat.id)}
            className={`truncate py-2 px-4 rounded-lg cursor-pointer ${
              isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } ${
              chat.id === activeChatId
                ? isDarkTheme
                  ? "bg-blue-700 text-white"
                  : "bg-blue-200 text-blue-800"
                : ""
            } transition-colors`}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* Theme toggle button */}
      <div className="mt-auto flex justify-end">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            isDarkTheme
              ? "bg-gray-700 text-yellow-400"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {isDarkTheme ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
} 