"use client";
import { useState, useEffect, useRef } from "react";
import { getBestModel } from "@/lib/ai";
import Image from "next/image";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import ConfirmationModal from "../components/ConfirmationModal";
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
  const [isDarkTheme, setIsDarkTheme] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ADD THIS: State for forwarding message
  const [forwardingMessage, setForwardingMessage] = useState<{
    role: string;
    content: string;
  } | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for multi-chat management
  const [allChats, setAllChats] = useState<ChatData[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    chatId: string | null;
    chatTitle: string;
  }>({
    isOpen: false,
    chatId: null,
    chatTitle: "",
  });

  // Effect for setting authentication status
  useEffect(() => {
    setIsAuthenticated(!!session?.user);
  }, [session]);

  // Effect for theme initialization (runs once on mount)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      setIsDarkTheme(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
    }
  }, []);

  // Effect for loading chats
  useEffect(() => {
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
          setCurrentMessages(deduplicateMessages(chatToLoad.messages));
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

  // Helper function to deduplicate consecutive messages with same role and content
  const deduplicateMessages = (messages: { role: string; content: string; modelId?: string }[]) => {
    if (messages.length === 0) return messages;
    
    const deduplicated = [messages[0]];
    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];
      
      // Skip if this message is identical to the previous one (same role and content)
      if (current.role === previous.role && current.content === previous.content) {
        continue;
      }
      
      deduplicated.push(current);
    }
    
    return deduplicated;
  };

  // UPDATED: Modified handleSendMessage function
  async function handleSendMessage() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const userMessage = { role: "user", content: trimmedPrompt };
    
    // Immediately show the user message
    setCurrentMessages(messages => [...messages, userMessage]);
    
    if (selectedModel === "autopick") {
      // Show "Selecting model..." for autopick
      setForwardingMessage({
        role: "assistant",
        content: `<routePrompt prompt="${trimmedPrompt}" model="Selecting model..."/>`,
      });
      
      // Small delay then update with actual model
      setTimeout(async () => {
        try {
          const actualModel = await getBestModel(trimmedPrompt);
          setForwardingMessage({
            role: "assistant",
            content: `<routePrompt prompt="${trimmedPrompt}" model="${actualModel}"/>`,
          });
        } catch (error) {
          setForwardingMessage({
            role: "assistant",
            content: `<routePrompt prompt="${trimmedPrompt}" model="openai/gpt-4o-mini"/>`,
          });
        }
      }, 200);
    } else {
      // Direct model selection - no forwarding message needed, just loading state
      setForwardingMessage(null);
    }
    
    setPrompt("");
    setLoading(true);
      try {
        let currentChatId = activeChatId;

        // If no active chat, create a new one with the user message
        if (!currentChatId) {
          const newChatId = Date.now().toString();
          const chatTitle =
            trimmedPrompt.substring(0, 28) +
            (trimmedPrompt.length > 28 ? "..." : "");
          const newChatSession = {
            id: newChatId,
            title: chatTitle,
            messages: [userMessage], // Save user message to backend
          };

          const newChat = await ChatService.saveChat(newChatSession, isAuthenticated);
          if (newChat) {
            setAllChats((prevChats) => [...prevChats, newChat]);
            setActiveChatId(newChatId);
            router.replace(`/?chatId=${newChatId}`);
            currentChatId = newChatId;
          } else {
            throw new Error("Failed to save new chat.");
          }
        } else {
          // Update existing chat with the user message
          const messagesForUpdate = [...currentMessages];
          const updatedChatWithMessages = await ChatService.updateChat(
            currentChatId,
            messagesForUpdate,
            isAuthenticated
          );
          if (updatedChatWithMessages) {
            setAllChats((prevAllChats) =>
              prevAllChats.map((chat) =>
                chat.id === currentChatId ? updatedChatWithMessages : chat
              )
            );
          } else {
            throw new Error("Failed to update chat with messages.");
          }
        }

        // Call the backend API route to get only the AI response
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId: currentChatId, messageContent: trimmedPrompt, selectedModel }),
        });

        if (!response.ok) {
          throw new Error(`Error processing message: ${response.statusText}`);
        }

        const result = await response.json();

        // Extract the latest AI response from the returned chat object
        const latestMessage = result.messages[result.messages.length - 1];
        if (latestMessage && latestMessage.role === 'assistant') {
          const aiResponse = { 
            role: "assistant", 
            content: latestMessage.content, 
            modelId: latestMessage.modelId 
          };
          setCurrentMessages(prevMessages => [...prevMessages, aiResponse]);
          
          // Update the chat in allChats with the complete conversation
          setAllChats((prevAllChats) =>
            prevAllChats.map((chat) =>
              chat.id === currentChatId 
                ? { ...chat, messages: [...chat.messages, userMessage, aiResponse] }
                : chat
            )
          );
        }
        
        // Clear the forwarding message since we now have the AI response
        setForwardingMessage(null);

      } catch (error) {
        console.error("Error sending message:", error);
        
        // Clear forwarding message on error
        setForwardingMessage(null);
        
        // Add an error message to the chat
        setCurrentMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: "An error occurred while processing your message." },
        ]);
      } finally {
        setLoading(false);
      }
    }

  function toggleTheme() {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function handleNewChat() {
    setCurrentMessages([]);
    setActiveChatId(null);
    setPrompt("");
    setForwardingMessage(null); // Clear forwarding message on new chat
    router.replace("/");
  }

  function handleSelectChat(chatId: string) {
    const selectedChat = allChats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(selectedChat.id);
      setCurrentMessages(deduplicateMessages(selectedChat.messages));
      setForwardingMessage(null); // Clear forwarding message when switching chats
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      router.replace(`/?chatId=${chatId}`);
    }
  }

  function handleDeleteChat(chatId: string) {
    const chatToDelete = allChats.find((chat) => chat.id === chatId);
    if (chatToDelete) {
      setDeleteModal({
        isOpen: true,
        chatId: chatId,
        chatTitle: chatToDelete.title,
      });
    }
  }

  async function confirmDeleteChat() {
    if (!deleteModal.chatId) return;

    try {
      const success = await ChatService.deleteChat(deleteModal.chatId, isAuthenticated);
      
      if (success) {
        // Remove chat from the list
        setAllChats((prevChats) => 
          prevChats.filter((chat) => chat.id !== deleteModal.chatId)
        );

        // If the deleted chat was active, clear the chat view
        if (activeChatId === deleteModal.chatId) {
          setActiveChatId(null);
          setCurrentMessages([]);
          setForwardingMessage(null);
          router.replace("/");
        }

        // Close the modal
        setDeleteModal({
          isOpen: false,
          chatId: null,
          chatTitle: "",
        });
      } else {
        console.error("Failed to delete chat");
        // You could add a toast notification here for better UX
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      // You could add a toast notification here for better UX
    }
  }

  // Show minimal loading screen while determining theme
  if (isDarkTheme === null) {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex h-screen w-full overflow-hidden ${
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
          handleDeleteChat={handleDeleteChat}
          sidebarRef={sidebarRef}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Mobile header */}
          <div className={`md:hidden p-3 sm:p-4 flex justify-between items-center border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
            <button 
              onClick={toggleSidebar} 
              className={`p-2 rounded-lg touch-manipulation ${
                isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
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
            <div className="flex items-center gap-2">
              <Image
                src="/icon.png"
                alt="Cyris AI"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <h1 className="text-lg sm:text-xl font-bold">Cyris AI</h1>
            </div>
            <div className="w-10"></div>
          </div>

          {/* UPDATED: Pass forwardingMessage to ChatMessages */}
          <ChatMessages
            currentMessages={currentMessages}
            forwardingMessage={forwardingMessage}
            loading={loading}
            isDarkTheme={isDarkTheme}
          />

          <div className="flex-shrink-0">
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, chatId: null, chatTitle: "" })}
        onConfirm={confirmDeleteChat}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteModal.chatTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDarkTheme={isDarkTheme}
        isDestructive={true}
      />
    </>
  );
}
