"use client";
import ProviderIcon from "./ProviderIcon";
import { parseRoutePrompt } from "@/lib/utils";
import { AI_MODELS } from "@/lib/constants";

interface ChatMessagesProps {
  currentMessages: Array<{ role: string; content: string; modelId?: string }>;
  forwardingMessage: { role: string; content: string; modelId?: string } | null; // ADD THIS
  loading: boolean;
  isDarkTheme: boolean;
}

export default function ChatMessages({
  currentMessages,
  forwardingMessage, // ADD THIS
  loading,
  isDarkTheme,
}: ChatMessagesProps) {
  // Helper function to get model display name
  const getModelDisplayName = (modelId: string): string => {
    const modelInfo = AI_MODELS.find(m => m.id === modelId);
    return modelInfo?.name || modelId;
  };

  // Combine regular messages with forwarding message if it exists
  const allMessagesToDisplay = forwardingMessage
    ? [...currentMessages, forwardingMessage]
    : currentMessages;

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
      {allMessagesToDisplay.length === 0 ? (
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
        allMessagesToDisplay.map((message, idx) => (
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
                              {getModelDisplayName(routeInfo.model)}
                            </span>
                          )}
                        </div>
                      );
                    }
                    // Regular AI response content
                    return (
                      <div>
                        <div className="mb-2">{message.content}</div>
                        {/* Model information footer */}
                        {message.modelId && (
                          <div className={`flex items-center gap-1.5 text-xs ${
                            isDarkTheme ? "text-gray-400" : "text-gray-600"
                          } border-t ${
                            isDarkTheme ? "border-gray-700" : "border-gray-300"
                          } pt-2 mt-2`}>
                            <ProviderIcon
                              model={message.modelId}
                              className="w-3 h-3"
                            />
                            <span>Powered by {getModelDisplayName(message.modelId)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))
      )}
      {/* Only show loading indicator if loading and no forwarding message */}
      {loading && !forwardingMessage && (
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
