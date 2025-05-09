"use client";
import { useState, useEffect, useRef } from "react";
import { getBestModel } from "@/lib/ai";
import { Sun, Moon, ChevronDown } from "lucide-react";
import Image from "next/image";
import ProviderIcon from "./components/ProviderIcon";

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

  // New state variables for multi-chat management
  const [allChats, setAllChats] = useState<
    {
      id: string;
      title: string;
      messages: { role: string; content: string }[];
    }[]
  >([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Effect for theme and loading chats from localStorage on initial mount
  useEffect(() => {
    // Theme detection
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkTheme(prefersDark);

    // Load chats from localStorage
    const storedChats = localStorage.getItem("cyrisUserChats");
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        if (Array.isArray(parsedChats)) {
          setAllChats(parsedChats);
          // Optionally, load the last active chat or the newest chat.
          // For now, we start with a clean slate, user picks or starts new.
        }
      } catch (error) {
        console.error("Failed to parse chats from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("cyrisUserChats");
      }
    }
    setCurrentMessages([]); // Start with an empty current chat view
    setActiveChatId(null); // No active chat selected initially
  }, []);

  // Effect to handle clicks outside the sidebar to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        // Check if window width is less than md breakpoint (768px typical)
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
  }, [isSidebarOpen]); // Re-run if isSidebarOpen changes

  // Effect for saving chats to localStorage whenever allChats changes
  useEffect(() => {
    // Avoid writing to localStorage on initial empty state if nothing was there before
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

    // Update current messages immediately with user's message for responsiveness
    const updatedCurrentMessagesWithUser = [...currentMessages, userMessage];
    setCurrentMessages(updatedCurrentMessagesWithUser);

    setLoading(true);
    setPrompt(""); // Clear prompt input after grabbing its value

    let modelResponseContent = "";
    try {
      if (selectedModel === "autopick") {
        modelResponseContent =
          (await getBestModel(trimmedPrompt)) || "Something went wrong.";
      } else {
        // Placeholder for specific model calls
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
      // Update messages in an existing active chat
      setAllChats((prevAllChats) =>
        prevAllChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: finalCurrentMessages }
            : chat
        )
      );
    } else {
      // Create a new chat session
      const newChatId = Date.now().toString();
      const chatTitle =
        trimmedPrompt.substring(0, 28) +
        (trimmedPrompt.length > 28 ? "..." : "");
      const newChatSession = {
        id: newChatId,
        title: chatTitle,
        messages: finalCurrentMessages,
      };
      setAllChats((prevAllChats) => [newChatSession, ...prevAllChats]); // Add new chat to the beginning
      setActiveChatId(newChatId); // Set the new chat as active
    }

    setLoading(false);
  }

  function toggleTheme() {
    setIsDarkTheme((prevIsDarkTheme) => {
      const newTheme = !prevIsDarkTheme;
      // You could also save this preference to localStorage if desired
      // localStorage.setItem("cyrisTheme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function handleNewChat() {
    setCurrentMessages([]);
    setActiveChatId(null);
    setPrompt(""); // Clear input field for the new chat
  }

  function handleSelectChat(chatId: string) {
    const selectedChat = allChats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(selectedChat.id);
      setCurrentMessages(selectedChat.messages);
      // Collapse sidebar on mobile after selecting a chat
      if (window.innerWidth < 768) {
        // 768px is a common breakpoint for 'md'
        setIsSidebarOpen(false);
      }
    }
  }

  return (
    <>
      <div
        className={`flex h-screen ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Left sidebar - Chat history */}
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

          {/* Chat controls and history - allow this section to grow and scroll */}
          <div className="space-y-2 flex-grow overflow-y-auto mb-4">
            <button
              className={`w-full py-2 px-4 rounded-lg text-left ${
                isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
              } transition-colors`}
              onClick={handleNewChat}
            >
              New Chat
            </button>

            {/* History items - now lists all chat sessions */}
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

          {/* Theme toggle button at the bottom right */}
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

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header for mobile with Menu button */}
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
            <div className="w-6"></div> {/* Placeholder for balance */}
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Welcome to Cyris AI
                </h2>
                <p
                  className={`text-base sm:text-lg ${
                    isDarkTheme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Start a conversation with our AI assistant
                </p>
              </div>
            ) : (
              currentMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg
                      p-2.5 text-sm
                      sm:p-3 sm:text-base
                      ${
                        message.role === "user"
                          ? isDarkTheme
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkTheme
                          ? "bg-gray-800 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <>
                        {(() => {
                          const routeInfo = parseRoutePrompt(message.content);
                          if (routeInfo.isRouting) {
                            return (
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm sm:text-base opacity-90">
                                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
                                <span>Forwarding</span>
                                <span className="font-semibold break-all">
                                  &ldquo;{routeInfo.prompt}&rdquo;
                                </span>
                                <span>to</span>
                                <span className="font-semibold flex items-center gap-1 shrink-0">
                                  <ProviderIcon
                                    model={routeInfo.model}
                                    className="w-3.5 h-3.5"
                                  />
                                  {routeInfo.model}
                                </span>
                              </div>
                            );
                          }
                          return message.content;
                        })()}
                      </>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div
                  className={`inline-block rounded-lg p-3 ${
                    isDarkTheme ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className={`p-3 sm:p-4 border-t ${
              isDarkTheme
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-100"
            }`}
          >
            {/* New layout: Model select button, input, send button in a row */}
            <div className="flex items-center space-x-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-auto flex items-center gap-2 pr-8 pl-3 py-2.5 rounded-md text-sm sm:text-base font-medium ${
                    isDarkTheme
                      ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {selectedModel === "autopick" ? (
                    <span>✨ AutoPick</span>
                  ) : (
                    <>
                      <ProviderIcon model={selectedModel} className="w-4 h-4" />
                      {selectedModel === "openai/o4-mini-high" && "GPT 4o"}
                      {selectedModel === "google/gemini-2.5-flash-preview" && "Gemini 2.5"}
                      {selectedModel === "anthropic/claude-3.5-sonnet" && "Claude 3.5"}
                    </>
                  )}
                </button>
                <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkTheme ? "text-gray-400" : "text-gray-600"
                } pointer-events-none transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                
                {isDropdownOpen && (
                  <div className={`absolute z-50 bottom-full mb-1 w-full rounded-md shadow-lg ${
                    isDarkTheme ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                  } border transform origin-bottom transition-all duration-200 ease-out`}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedModel("autopick");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                          isDarkTheme
                            ? "hover:bg-gray-600 text-white"
                            : "hover:bg-gray-100 text-gray-900"
                        }`}
                      >
                        <span>✨</span>
                        <span>AutoPick</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModel("openai/o4-mini-high");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                          isDarkTheme
                            ? "hover:bg-gray-600 text-white"
                            : "hover:bg-gray-100 text-gray-900"
                        }`}
                      >
                        <ProviderIcon model="openai/o4-mini-high" className="w-4 h-4" />
                        <span>GPT 4o</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModel("google/gemini-2.5-flash-preview");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                          isDarkTheme
                            ? "hover:bg-gray-600 text-white"
                            : "hover:bg-gray-100 text-gray-900"
                        }`}
                      >
                        <ProviderIcon model="google/gemini-2.5-flash-preview" className="w-4 h-4" />
                        <span>Gemini 2.5</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModel("anthropic/claude-3.5-sonnet");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                          isDarkTheme
                            ? "hover:bg-gray-600 text-white"
                            : "hover:bg-gray-100 text-gray-900"
                        }`}
                      >
                        <ProviderIcon model="anthropic/claude-3.5-sonnet" className="w-4 h-4" />
                        <span>Claude 3.5</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className={`w-full px-3 sm:px-4 py-2.5 rounded-md text-sm sm:text-base ${
                    isDarkTheme
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={loading || !prompt.trim()}
                // Small icon button
                className={`p-2.5 rounded-md ${
                  loading || !prompt.trim()
                    ? isDarkTheme
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isDarkTheme
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5" // Consistent small icon
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
