"use client";
import { useState, useEffect, useRef } from "react";
import { getBestModel } from "@/lib/ai";
import Image from "next/image";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatService, ChatData } from "@/lib/chatService";
import { parseRoutePrompt } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("autopick");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<
    { role: string; content: string; modelId?: string }[]
  >([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for multi-chat management
  const [allChats, setAllChats] = useState<ChatData[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effect for setting authentication status
  useEffect(() => {
    setIsAuthenticated(!!session?.user);
  }, [session]);

  // Effect for theme and loading chats
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkTheme(prefersDark);

    async function loadChats() {
      if (status === "loading") return;
      
      const authenticated = !!session?.user;
      
      if (authenticated && !isAuthenticated) {
        await ChatService.migrateLocalChatsToDatabase();
      }
      
      const chats = await ChatService.getChats(authenticated);
      setAllChats(chats);
      
      const chatIdFromParams = searchParams.get("chatId");
      if (chatIdFromParams) {
        const chatToLoad = chats.find((chat) => chat.id === chatIdFromParams);
        if (chatToLoad) {
          setActiveChatId(chatToLoad.id);
          setCurrentMessages(chatToLoad.messages);
        }
      } else {
        setCurrentMessages([]);
        setActiveChatId(null);
      }
    }

    loadChats();
  }, [session, status, searchParams, isAuthenticated]);

  // Effect for handling clicks outside the sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);


  // Effect for handling clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  async function handleSendMessage() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const userMessage = { role: "user", content: trimmedPrompt };
    const updatedCurrentMessagesWithUser = [...currentMessages, userMessage];
    setCurrentMessages(updatedCurrentMessagesWithUser);

    setPrompt("");

    // Add an intermediate "Forwarding..." message
    const forwardingMessage = {
      role: "assistant",
      content: `<routePrompt prompt="${trimmedPrompt}" model="AutoPick"/>`, // Use a placeholder model name for display
    };
    setCurrentMessages([...updatedCurrentMessagesWithUser, forwardingMessage]);

    setLoading(true); // Move this line here


    try {
      let currentChatId = activeChatId;

      // If no active chat, create a new one first
      if (!currentChatId) {
        const newChatId = Date.now().toString();
        const chatTitle =
          trimmedPrompt.substring(0, 28) +
          (trimmedPrompt.length > 28 ? "..." : "");
        const newChatSession = {
          id: newChatId,
          title: chatTitle,
          messages: [userMessage], // Include the initial user message
        };

        const savedChat = await ChatService.saveChat(newChatSession, isAuthenticated);
        if (savedChat) {
          setAllChats((prevAllChats) => [savedChat, ...prevAllChats]);
          setActiveChatId(newChatId);
          router.replace(`/?chatId=${newChatId}`);
          currentChatId = newChatId;
        } else {
          throw new Error("Failed to save new chat.");
        }
      } else {
         // If active chat exists, update it with the user message immediately
         const updatedChatWithUserMessage = await ChatService.updateChat(
          currentChatId,
          updatedCurrentMessagesWithUser, // Use the state before adding forwardingMessage
          isAuthenticated
        );
        if (updatedChatWithUserMessage) {
          setAllChats((prevAllChats) =>
            prevAllChats.map((chat) =>
              chat.id === currentChatId ? updatedChatWithUserMessage : chat
            )
          );
          // Removed premature setCurrentMessages update
        } else {
          throw new Error("Failed to update chat with user message.");
        }
      }


      // Call the new backend API route to process the message and get the AI response
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: currentChatId, messageContent: trimmedPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Error processing message: ${response.statusText}`);
      }

      const updatedChat = await response.json();

      // Update frontend state with the full chat history from the backend
      setCurrentMessages(updatedChat.messages);
      setAllChats((prevAllChats) =>
        prevAllChats.map((chat) =>
          chat.id === updatedChat.id ? updatedChat : chat
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally, add an error message to the chat
      setCurrentMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "An error occurred while processing your message." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleTheme() {
    setIsDarkTheme((prev) => !prev);
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function handleNewChat() {
    setCurrentMessages([]);
    setActiveChatId(null);
    setPrompt("");
    router.replace("/");
  }

  function handleSelectChat(chatId: string) {
    const selectedChat = allChats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(selectedChat.id);
      setCurrentMessages(selectedChat.messages);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      router.replace(`/?chatId=${chatId}`);
    }
  }

  return (
    <>
      <div
        className={`flex h-screen ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <ChatSidebar
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
          allChats={allChats}
          activeChatId={activeChatId}
          handleNewChat={handleNewChat}
          handleSelectChat={handleSelectChat}
          sidebarRef={sidebarRef}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <div className="md:hidden p-4 flex justify-between items-center border-b border-gray-700">
            <button onClick={toggleSidebar} className="p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <Image
              src="/icon.png"
              alt="Cyris AI"
              width={32}
              height={32}
              className="rounded-lg mr-2"
            />
            <h1 className="text-2xl font-bold">Cyris AI</h1>
            <div className="w-6"></div>
          </div>

          <ChatMessages
            currentMessages={currentMessages}
            loading={loading}
            isDarkTheme={isDarkTheme}
          />

          <ChatInput
            isDarkTheme={isDarkTheme}
            prompt={prompt}
            setPrompt={setPrompt}
            loading={loading}
            handleSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            dropdownRef={dropdownRef}
          />
        </div>
      </div>
    </>
  );
}
