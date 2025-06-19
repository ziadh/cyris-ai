"use client";
import { useEffect, useRef, useState } from "react";
import ProviderIcon from "./ProviderIcon";
import MarkdownRenderer from "./MarkdownRenderer";
import ImageViewer from "./ImageViewer";
import { parseRoutePrompt, isMarkdownContent } from "@/lib/utils";
import { AI_MODELS } from "@/lib/constants";
import { Maximize2, Download, AlertTriangle } from "lucide-react";
import Image from "next/image";

// Image component with error handling for expired URLs
function ImageWithErrorHandling({ 
  src, 
  alt, 
  className, 
  style, 
  onClick, 
  isDarkTheme 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  style?: React.CSSProperties; 
  onClick?: () => void; 
  isDarkTheme: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed ${
        isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
      }`} style={style}>
        <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
        <p className={`text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Image Expired
        </p>
        <p className={`text-xs text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          This image URL has expired. OpenAI images are only available for 2 hours.
        </p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center p-8 rounded-lg ${
          isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'
        }`} style={style}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, display: isLoading ? 'none' : 'block' }}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  // Helper function to get model display name
  const getModelDisplayName = (modelId: string): string => {
    const modelInfo = AI_MODELS.find((m) => m.id === modelId);
    return modelInfo?.name || modelId;
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageViewerOpen(true);
  };

  const handleQuickDownload = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cyris-ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
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
                            {message.content.startsWith(
                              "![Generated Image]("
                            ) ? (
                              <div className="space-y-2">
                                <div className="relative group">
                                  <ImageWithErrorHandling
                                    src={
                                      message.content.match(
                                        /\(([^)]+)\)/
                                      )?.[1] || ""
                                    }
                                    alt="Generated Image"
                                    className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                                    style={{
                                      maxHeight: "250px",
                                      maxWidth: "100%",
                                    }}
                                    onClick={() =>
                                      handleImageClick(
                                        message.content.match(
                                          /\(([^)]+)\)/
                                        )?.[1] || ""
                                      )
                                    }
                                    isDarkTheme={isDarkTheme}
                                  />

                                  {/* Hover overlay with action buttons */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleImageClick(
                                            message.content.match(
                                              /\(([^)]+)\)/
                                            )?.[1] || ""
                                          )
                                        }
                                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-110"
                                        title="View Full Size"
                                      >
                                        <Maximize2 className="w-4 h-4 text-gray-700" />
                                      </button>
                                      <button
                                        onClick={(e) =>
                                          handleQuickDownload(
                                            message.content.match(
                                              /\(([^)]+)\)/
                                            )?.[1] || "",
                                            e
                                          )
                                        }
                                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-110"
                                        title="Quick Download"
                                      >
                                        <Download className="w-4 h-4 text-gray-700" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-xs sm:text-sm opacity-75">
                                    🎨 Generated image
                                  </p>
                                  <p className="text-xs opacity-60">
                                    Click to view full size
                                  </p>
                                </div>
                              </div>
                            ) : isMarkdownContent(message.content) ? (
                              <MarkdownRenderer
                                content={message.content}
                                isDarkTheme={isDarkTheme}
                              />
                            ) : (
                              <div className="break-words whitespace-pre-wrap">
                                {message.content}
                              </div>
                            )}
                          </div>
                          {/* Model information footer */}
                          {message.modelId && (
                            <div
                              className={`flex items-center gap-1.5 text-xs ${
                                isDarkTheme ? "text-gray-400" : "text-gray-600"
                              } border-t ${
                                isDarkTheme
                                  ? "border-gray-700"
                                  : "border-gray-300"
                              } pt-2 mt-2`}
                            >
                              <ProviderIcon
                                model={message.modelId}
                                className="w-3 h-3"
                              />
                              <span>
                                {getModelDisplayName(message.modelId)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="break-words whitespace-pre-wrap">
                    {message.content}
                  </div>
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

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedImageUrl}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
}
