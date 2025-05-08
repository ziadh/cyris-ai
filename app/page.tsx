"use client";
import { useState, useEffect } from "react";
import { getBestModel } from "@/lib/ai";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("autopick");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Check system preference for theme on initial load
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkTheme(isDark);
  }, []);

  async function handleSendMessage() {
    if (!prompt.trim()) return;

    // Add user message to chat
    setChatHistory((prev) => [...prev, { role: "user", content: prompt }]);

    setLoading(true);
    let modelResponse = "";

    if (selectedModel === "autopick") {
      modelResponse = (await getBestModel(prompt)) || "";
    } else {
      // This is a placeholder - actual implementation would use the selected model
      modelResponse = `You selected ${selectedModel} (functionality to be implemented)`;
    }

    // Add AI response to chat
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: modelResponse },
    ]);
    setPrompt("");
    setLoading(false);
  }

  function toggleTheme() {
    setIsDarkTheme(!isDarkTheme);
  }

  return (
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
        } p-4 overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <Image
            src="/icon.png"
            alt="Cyris AI"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <h1 className="text-2xl font-bold">Cyris AI</h1>
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

        <div className="space-y-2">
          <button
            className={`w-full py-2 px-4 rounded-lg text-left ${
              isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } transition-colors`}
          >
            New Chat
          </button>

          {/* History items */}
          {chatHistory
            .filter((msg) => msg.role === "user")
            .map((msg, idx) => (
              <div
                key={idx}
                className={`truncate py-2 px-4 rounded-lg cursor-pointer ${
                  isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                {msg.content.substring(0, 28)}...
              </div>
            ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
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
            chatHistory.map((message, idx) => (
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
                  {message.content}
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
  );
}
