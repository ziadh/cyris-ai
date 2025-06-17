"use client";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

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
  handleDeleteChat: (chatId: string) => void;
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
  handleDeleteChat,
  sidebarRef,
  isSidebarOpen,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profilePicRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        profilePicRef.current &&
        !profilePicRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, profilePicRef]);

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
          className={`w-full py-2 px-4 rounded-lg text-left flex items-center gap-2 ${
            isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
          } transition-colors`}
          onClick={handleNewChat}
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        {/* History items */}
        {allChats.map((chat) => (
          <div
            key={chat.id}
            className={`relative group py-2 px-4 rounded-lg cursor-pointer flex items-center justify-between ${
              isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } ${
              chat.id === activeChatId
                ? isDarkTheme
                  ? "bg-blue-700 text-white"
                  : "bg-blue-200 text-blue-800"
                : ""
            } transition-all duration-200`}
            onMouseEnter={() => setHoveredChatId(chat.id)}
            onMouseLeave={() => setHoveredChatId(null)}
          >
            <div
              onClick={() => handleSelectChat(chat.id)}
              className="flex-1 truncate pr-2"
            >
              {chat.title}
            </div>
            
            {/* Delete Button - appears on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
              className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 ${
                hoveredChatId === chat.id
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 pointer-events-none"
              } ${
                isDarkTheme
                  ? "hover:bg-red-600 text-gray-400 hover:text-white"
                  : "hover:bg-red-500 text-gray-500 hover:text-white"
              }`}
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Theme toggle and auth */}
      <div className="mt-auto flex justify-between items-center">
        <div>
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <div className="relative"> {/* Add relative positioning to the container */}
                  <Image
                    ref={profilePicRef} // Add ref to the profile picture
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  />
                  {isMenuOpen && (
                    <div
                      ref={menuRef} // Add ref to the menu
                      className={`absolute bottom-full mb-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isDarkTheme ? 'bg-gray-700' : 'bg-white'}`}
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={() => signOut()}
                          className={`block w-full text-left px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className={`px-4 py-2 rounded-lg ${
                isDarkTheme
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white transition-colors`}
            >
              Sign In
            </button>
          )}
        </div>
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
