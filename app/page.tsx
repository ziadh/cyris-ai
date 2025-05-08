"use client";
import { useState, useEffect } from "react";
import { getBestModel } from "@/lib/ai";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import ProviderIcon from "./components/ProviderIcon";

// Add keyframe animation for progress
const progressAnimation = `@keyframes progress {
  0% { width: 0% }
  100% { width: 100% }
}`;

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
  const [currentMessages, setCurrentMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

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

  // Effect for saving chats to localStorage whenever allChats changes
  useEffect(() => {
    // Avoid writing to localStorage on initial empty state if nothing was there before
    if (allChats.length > 0 || localStorage.getItem("cyrisUserChats")) {
      localStorage.setItem("cyrisUserChats", JSON.stringify(allChats));
    }
  }, [allChats]);

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
    }
  }

  return (
    <>
      <style jsx global>{`
        ${progressAnimation}
      `}</style>
      <div
        className={`flex h-screen ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Left sidebar - Chat history */}
        <div
          className={`w-[12.5%] border-r ${
            isDarkTheme
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          } p-4 flex flex-col h-full overflow-y-auto`}
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
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold mb-2">Welcome to Cyris AI</h2>
                <p
                  className={`text-lg ${
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
                    className={`max-w-[70%] rounded-lg p-3 ${
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
                              <div className="flex flex-col gap-2">
                                <div className="text-sm opacity-80">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    Forwarding{" "}
                                    <span className="font-bold">
                                      {routeInfo.prompt}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-bold flex items-center gap-2">
                                      <ProviderIcon
                                        model={routeInfo.model}
                                        className="w-4 h-4"
                                      />
                                      {routeInfo.model}
                                    </span>
                                  </div>
                                </div>
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
                  className={`max-w-[70%] rounded-lg p-3 ${
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
            className={`p-4 border-t ${
              isDarkTheme
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`px-3 py-2 rounded-md ${
                  isDarkTheme
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="autopick">AutoPick</option>
                <option value="openai/o4-mini-high">GPT 4o</option>
                <option value="google/gemini-2.5-flash-preview">
                  Gemini 2.5 Flash
                </option>
                <option value="anthropic/claude-3.5-sonnet">
                  Claude 3.5 Sonnet
                </option>
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className={`w-full px-4 py-2 rounded-md ${
                    isDarkTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={loading || !prompt.trim()}
                className={`p-2 rounded-md ${
                  loading || !prompt.trim()
                    ? isDarkTheme
                      ? "bg-gray-700 text-gray-500"
                      : "bg-gray-200 text-gray-400"
                    : isDarkTheme
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                } transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
