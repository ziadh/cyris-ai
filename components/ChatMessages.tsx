"use client";
import { useEffect, useRef } from "react";
import ProviderIcon from "./ProviderIcon";
import MarkdownRenderer from "./MarkdownRenderer";
import { parseRoutePrompt, isMarkdownContent } from "@/lib/utils";
import { AI_MODELS } from "@/lib/constants";
import Image from "next/image";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to get model display name
  const getModelDisplayName = (modelId: string): string => {
    const modelInfo = AI_MODELS.find(m => m.id === modelId);
    return modelInfo?.name || modelId;
  };

  // Combine regular messages with forwarding message if it exists
  const allMessagesToDisplay = forwardingMessage
    ? [...currentMessages, forwardingMessage]
    : currentMessages;

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [allMessagesToDisplay.length, loading, forwardingMessage]);

  // Also scroll when content of the last message changes (for streaming effects)
  useEffect(() => {
    const lastMessage = allMessagesToDisplay[allMessagesToDisplay.length - 1];
    if (lastMessage) {
      scrollToBottom();
    }
  }, [allMessagesToDisplay[allMessagesToDisplay.length - 1]?.content]);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 sm:space-y-4"
    >
      {allMessagesToDisplay.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              Welcome to Cyris AI
            </h2>
            <p
              className={`text-sm sm:text-base lg:text-lg mb-4 ${
                isDarkTheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Start a conversation with our AI assistant
            </p>
            {/* Quick feature highlights */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${
                isDarkTheme ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}>
                ⚡ Super Fast
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                isDarkTheme ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
              }`}>
                🧠 Smart Routing
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                isDarkTheme ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
              }`}>
                🎨 Image Gen
              </span>
            </div>
            <p
              className={`text-xs ${
                isDarkTheme ? "text-gray-500" : "text-gray-400"
              }`}
            >
              💡 New here? Click the help button (?) to take a quick tour!
            </p>
          </div>
        </div>
      ) : (
        <>
          {allMessagesToDisplay.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`inline-block rounded-lg max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%]
                  p-3 text-sm
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
                        <div className="w-full">
                          <div className="mb-2 overflow-hidden">
                            {/* Check if content is an image markdown */}
                            {message.content.startsWith('![Generated Image](') ? (
                              <div className="space-y-2">
                                <div className="relative">
                                  <img 
                                    src={message.content.match(/\(([^)]+)\)/)?.[1] || ''} 
                                    alt="Generated Image" 
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                    style={{ maxHeight: '250px', maxWidth: '100%' }}
                                  />
                                </div>
                                <p className="text-xs sm:text-sm opacity-75">🎨 Generated image</p>
                              </div>
                            ) : isMarkdownContent(message.content) ? (
                              <MarkdownRenderer content={message.content} isDarkTheme={isDarkTheme} />
                            ) : (
                              <div className="break-words whitespace-pre-wrap">{message.content}</div>
                            )}
                          </div>
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
                              <span>{getModelDisplayName(message.modelId)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="break-words whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Only show loading indicator if loading and no forwarding message */}
          {loading && !forwardingMessage && (
            <div className="flex justify-start">
              <div
                className={`inline-block rounded-lg p-4 sm:p-3 ${
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
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
