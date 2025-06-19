"use client";
import { useState, useEffect, useRef } from "react";
import { getBestModel } from "@/lib/ai";
import Image from "next/image";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import ConfirmationModal from "../components/ConfirmationModal";
import OnboardingFlow from "../components/OnboardingFlow";
import HelpButton from "../components/HelpButton";
import ShareModal from "../components/ShareModal";
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

  // State for share modal
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    chatId: string | null;
    chatTitle: string;
  }>({
    isOpen: false,
    chatId: null,
    chatTitle: "",
  });

  // State for onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const wasAuthenticated = isAuthenticated;
    const nowAuthenticated = !!session?.user;

    setIsAuthenticated(nowAuthenticated);

    // If user just signed in, migrate local chats
    if (!wasAuthenticated && nowAuthenticated && status !== "loading") {
      migrateLocalChats();
    }
  }, [session, status]);

  const migrateLocalChats = async () => {
    try {
      await ChatService.migrateLocalChatsToDatabase();
      // Reload chats after migration
      const chats = await ChatService.getChats(true);
      setAllChats(chats);
      console.log("Successfully migrated local chats to database");
    } catch (error) {
      console.error("Error migrating local chats:", error);
    }
  };

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
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
    async function loadChats() {
      if (status === "loading") return;

      const authenticated = !!session?.user;
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

  const deduplicateMessages = (
    messages: { role: string; content: string; modelId?: string }[]
  ) => {
    if (messages.length === 0) return messages;

    const deduplicated = [messages[0]];
    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];

      // Skip if this message is identical to the previous one (same role and content)
      if (
        current.role === previous.role &&
        current.content === previous.content
      ) {
        continue;
      }

      deduplicated.push(current);
    }

    return deduplicated;
  };

  async function handleSendMessage() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const userMessage = { role: "user", content: trimmedPrompt };

    setCurrentMessages((messages) => [...messages, userMessage]);

    if (selectedModel === "autopick") {
      // Don't show forwarding message immediately - wait to see if routing actually occurs
      setTimeout(async () => {
        try {
          const routerResponse = await getBestModel(trimmedPrompt);
          const routeInfo = parseRoutePrompt(routerResponse || "");

          // Only show forwarding message if routing actually occurred
          if (routeInfo.isRouting && routeInfo.model) {
            setForwardingMessage({
              role: "assistant",
              content: `<routePrompt prompt="${trimmedPrompt}" model="${routeInfo.model}"/>`,
            });
          }
        } catch (error) {
          // Don't show forwarding message on error
          console.error("Error getting routing decision:", error);
        }
      }, 200);
    } else {
      setForwardingMessage(null);
    }

    setPrompt("");
    setLoading(true);
    try {
      let currentChatId = activeChatId;

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

        const newChat = await ChatService.saveChat(
          newChatSession,
          isAuthenticated
        );
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

      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add BYOK API key for image generation models
      if (selectedModel === "openai/gpt-image-1") {
        const { getBYOKKey } = await import("@/lib/utils");
        const openaiKey = getBYOKKey("openai");
        if (openaiKey) {
          headers["x-byok-api-key"] = openaiKey;
        }
      }

      // Call the backend API route to get only the AI response
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers,
        body: JSON.stringify({
          chatId: currentChatId,
          messageContent: trimmedPrompt,
          selectedModel,
          isLocalChat: !isAuthenticated,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error processing message: ${response.statusText}`);
      }

      const result = await response.json();

      let aiResponse: {
        role: string;
        content: string;
        modelId?: string;
      };

      if (result.isLocalResponse) {
        // For unauthenticated users, the response contains just the message
        aiResponse = {
          role: "assistant",
          content: result.message.content,
          modelId: result.message.modelId,
        };
        setCurrentMessages((prevMessages) => [...prevMessages, aiResponse]);

        // Update local chat storage with the complete conversation
        if (currentChatId && !isAuthenticated) {
          const updatedMessages = [...currentMessages, userMessage, aiResponse];
          await ChatService.updateChat(
            currentChatId,
            updatedMessages,
            isAuthenticated
          );

          // Update the chat in allChats
          setAllChats((prevAllChats) =>
            prevAllChats.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: updatedMessages,
                  }
                : chat
            )
          );
        }
      } else {
        // For authenticated users, extract from the returned chat object
        const latestMessage = result.messages[result.messages.length - 1];
        if (latestMessage && latestMessage.role === "assistant") {
          aiResponse = {
            role: "assistant",
            content: latestMessage.content,
            modelId: latestMessage.modelId,
          };
          setCurrentMessages((prevMessages) => [...prevMessages, aiResponse]);

          // Update the chat in allChats with the complete conversation
          setAllChats((prevAllChats) =>
            prevAllChats.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, userMessage, aiResponse],
                  }
                : chat
            )
          );
        }
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
        {
          role: "assistant",
          content: "An error occurred while processing your message.",
        },
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

  function handleShareChat(chatId: string) {
    const chatToShare = allChats.find((chat) => chat.id === chatId);
    if (chatToShare) {
      setShareModal({
        isOpen: true,
        chatId: chatId,
        chatTitle: chatToShare.title,
      });
    }
  }

  async function confirmDeleteChat() {
    if (!deleteModal.chatId) return;

    try {
      const success = await ChatService.deleteChat(
        deleteModal.chatId,
        isAuthenticated
      );

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
          handleShareChat={handleShareChat}
          sidebarRef={sidebarRef}
          isSidebarOpen={isSidebarOpen}
          onShowOnboarding={() => setShowOnboarding(true)}
        />

        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Mobile header */}
          <div
            className={`md:hidden p-3 sm:p-4 flex justify-between items-center border-b ${
              isDarkTheme ? "border-gray-700" : "border-gray-200"
            } flex-shrink-0`}
          >
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg touch-manipulation ${
                isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-100"
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
            <HelpButton
              onShowOnboarding={() => setShowOnboarding(true)}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Local Storage Notification for Unauthenticated Users */}
          {!isAuthenticated && currentMessages.length > 0 && (
            <div
              className={`mx-4 mt-3 p-3 rounded-lg border-l-4 ${
                isDarkTheme
                  ? "bg-blue-500/10 border-blue-500 text-blue-300"
                  : "bg-blue-50 border-blue-500 text-blue-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    Your chats are saved locally. Sign in to save them
                    permanently and access them across devices.
                  </span>
                </div>
              </div>
            </div>
          )}

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
        onClose={() =>
          setDeleteModal({ isOpen: false, chatId: null, chatTitle: "" })
        }
        onConfirm={confirmDeleteChat}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteModal.chatTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDarkTheme={isDarkTheme}
        isDestructive={true}
      />

      {/* Share Modal */}
      {shareModal.chatId && (
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() =>
            setShareModal({ isOpen: false, chatId: null, chatTitle: "" })
          }
          chatId={shareModal.chatId}
          chatTitle={shareModal.chatTitle}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Onboarding Flow */}
      <OnboardingFlow
        isVisible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        isDarkTheme={isDarkTheme}
      />
    </>
  );
}
