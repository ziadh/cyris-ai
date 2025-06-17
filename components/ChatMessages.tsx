"use client";
import ProviderIcon from "./ProviderIcon";
import { parseRoutePrompt } from "@/lib/utils";

interface ChatMessagesProps {
  currentMessages: Array<{ role: string; content: string; modelId?: string }>;
  loading: boolean;
  isDarkTheme: boolean;
}

export default function ChatMessages({
  currentMessages,
  loading,
  isDarkTheme,
}: ChatMessagesProps) {
  return (
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
                          {routeInfo.model && ( // Conditionally render if model is defined
                            <span className="font-semibold flex items-center gap-1 shrink-0">
                              <ProviderIcon
                                model={routeInfo.model}
                                className="w-3.5 h-3.5"
                              />
                              {routeInfo.model}
                            </span>
                          )}
                        </div>
                      );
                    }
                    // Display model icon if modelId is present and not a routing message
                    if (message.modelId) {
                      return (
                        <div className="flex items-start gap-2">
                          <ProviderIcon
                            model={message.modelId}
                            className="w-4 h-4 mt-1 shrink-0"
                          />
                          <div>{message.content}</div>
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
  );
}
