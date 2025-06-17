"use client";
import { useState, useEffect, useRef } from "react";
import { getBestModel } from "@/lib/ai";
import Image from "next/image";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useRouter, useSearchParams } from "next/navigation";

// Utility function to parse routing format
function parseRoutePrompt(content: string) {
  const match = content.match(
    /<routePrompt prompt\s*=\s*"([^"]*)" model\s*=\s*"([^"]*)"\s*\/>/
  );
  if (match) {
    return {
      isRouting: true,
      prompt: match[1],
      model: match[2],
    };
  }
  return { isRouting: false, prompt: "", model: "" };
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("autopick");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for multi-chat management
  const [allChats, setAllChats] = useState<
    {
      id: string;
      title: string;
      messages: { role: string; content: string }[];
    }[]
  >([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Effect for theme and loading chats from localStorage
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkTheme(prefersDark);

    const storedChats = localStorage.getItem("cyrisUserChats");
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        if (Array.isArray(parsedChats)) {
          setAllChats(parsedChats);
        }
      } catch (error) {
        console.error("Failed to parse chats from localStorage:", error);
        localStorage.removeItem("cyrisUserChats");
      }
    }
    setCurrentMessages([]);
    setActiveChatId(null);

    const chatIdFromParams = searchParams.get("chatId");
    if (chatIdFromParams) {
      const storedChats = localStorage.getItem("cyrisUserChats");
      if (storedChats) {
        try {
          const parsedChats = JSON.parse(storedChats);
          if (Array.isArray(parsedChats)) {
            setAllChats(parsedChats);
            const chatToLoad = parsedChats.find(
              (chat) => chat.id === chatIdFromParams
            );
            if (chatToLoad) {
              setActiveChatId(chatToLoad.id);
              setCurrentMessages(chatToLoad.messages);
            }
          }
        } catch (error) {
          console.error("Failed to parse chats from localStorage:", error);
          localStorage.removeItem("cyrisUserChats");
        }
      }
    }
  }, [searchParams]);

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

  // Effect for saving chats to localStorage
  useEffect(() => {
    if (allChats.length > 0 || localStorage.getItem("cyrisUserChats")) {
      localStorage.setItem("cyrisUserChats", JSON.stringify(allChats));
    }
  }, [allChats]);

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

    setLoading(true);
    setPrompt("");

    let modelResponseContent = "";
    try {
      if (selectedModel === "autopick") {
        modelResponseContent =
          (await getBestModel(trimmedPrompt)) || "Something went wrong.";
      } else {
        modelResponseContent = `Response from ${selectedModel} for: "${trimmedPrompt}" (not implemented yet)`;
      }
    } catch (error) {
      console.error("Error fetching model response:", error);
      modelResponseContent = "An error occurred while fetching the response.";
    }

    const assistantMessage = {
      role: "assistant",
      content: modelResponseContent,
    };
    const finalCurrentMessages = [
      ...updatedCurrentMessagesWithUser,
      assistantMessage,
    ];
    setCurrentMessages(finalCurrentMessages);

    if (activeChatId) {
      setAllChats((prevAllChats) =>
        prevAllChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: finalCurrentMessages }
            : chat
        )
      );
    } else {
      const newChatId = Date.now().toString();
      const chatTitle =
        trimmedPrompt.substring(0, 28) +
        (trimmedPrompt.length > 28 ? "..." : "");
      const newChatSession = {
        id: newChatId,
        title: chatTitle,
        messages: finalCurrentMessages,
      };
      setAllChats((prevAllChats) => [newChatSession, ...prevAllChats]);
      setActiveChatId(newChatId);
      router.replace(`/?chatId=${newChatId}`);
    }

    setLoading(false);
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
