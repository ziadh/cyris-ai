"use client";
import { ChevronDown } from "lucide-react";
import ProviderIcon from "./ProviderIcon";
import { useRef } from "react";

interface ChatInputProps {
  isDarkTheme: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  loading: boolean;
  handleSendMessage: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatInput({
  isDarkTheme,
  prompt,
  setPrompt,
  loading,
  handleSendMessage,
  selectedModel,
  setSelectedModel,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
}: ChatInputProps) {
  return (
    <div
      className={`p-3 sm:p-4 border-t ${
        isDarkTheme
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-100"
      }`}
    >
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
                {selectedModel === "google/gemini-2.5-flash-preview" &&
                  "Gemini 2.5"}
                {selectedModel === "anthropic/claude-3.5-sonnet" && "Claude 3.5"}
              </>
            )}
          </button>
          <ChevronDown
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDarkTheme ? "text-gray-400" : "text-gray-600"
            } pointer-events-none transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />

          {isDropdownOpen && (
            <div
              className={`absolute z-50 bottom-full mb-1 w-full rounded-md shadow-lg ${
                isDarkTheme
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-200"
              } border transform origin-bottom transition-all duration-200 ease-out`}
            >
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
                  <ProviderIcon
                    model="google/gemini-2.5-flash-preview"
                    className="w-4 h-4"
                  />
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
                  <ProviderIcon
                    model="anthropic/claude-3.5-sonnet"
                    className="w-4 h-4"
                  />
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
            className="h-5 w-5"
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
  );
} 