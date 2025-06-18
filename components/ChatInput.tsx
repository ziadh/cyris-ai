"use client";
import { ChevronDown, Settings, X, Image as ImageIcon } from "lucide-react";
import ProviderIcon from "./ProviderIcon";
import { useRef, useState, useEffect } from "react";
import { AI_MODELS, AUTOPICK_MODEL } from "@/lib/constants";
import {
  isImageGenerationModel,
  hasBYOKKey,
  getProviderFromModelId,
} from "@/lib/utils";
import BYOKSettings from "./BYOKSettings";

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

const getModelInfo = (modelId: string) => {
  if (modelId === "autopick") {
    return AUTOPICK_MODEL;
  }

  return (
    AI_MODELS.find((model) => model.id === modelId) || {
      id: modelId,
      name: modelId,
      description: "AI assistant",
      icon: AUTOPICK_MODEL.icon, // fallback icon
    }
  );
};

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
  const selectedModelInfo = getModelInfo(selectedModel);
  const SelectedIcon = selectedModelInfo.icon;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasRequiredKey, setHasRequiredKey] = useState(true);
  const [keyUpdateTrigger, setKeyUpdateTrigger] = useState(0);
  const [showImageSuggestion, setShowImageSuggestion] = useState(false);
  const [dismissedImageSuggestion, setDismissedImageSuggestion] = useState(false);

  useEffect(() => {
    if (isImageGenerationModel(selectedModel)) {
      const provider = getProviderFromModelId(selectedModel);
      setHasRequiredKey(hasBYOKKey(provider));
    } else {
      setHasRequiredKey(true);
    }
  }, [selectedModel, keyUpdateTrigger]);

  // Detect image-related keywords in prompt
  useEffect(() => {
    if (dismissedImageSuggestion || isImageGenerationModel(selectedModel)) {
      setShowImageSuggestion(false);
      return;
    }

    const imageKeywords = /\b(img|image|images|pic|pics|picture|pictures|photo|photos|generate|create|make|draw|design)\b/i;
    const hasImageKeyword = imageKeywords.test(prompt);
    
    setShowImageSuggestion(hasImageKeyword && prompt.trim().length > 0);
  }, [prompt, selectedModel, dismissedImageSuggestion]);

  const handleKeyUpdated = () => {
    setKeyUpdateTrigger((prev) => prev + 1);
  };

  const handleSwitchToImageModel = () => {
    setSelectedModel("openai/gpt-image-1");
    setShowImageSuggestion(false);
    setDismissedImageSuggestion(true);
  };

  const handleDismissImageSuggestion = () => {
    setShowImageSuggestion(false);
    setDismissedImageSuggestion(true);
  };

  const isImageModel = isImageGenerationModel(selectedModel);
  const canSendMessage = prompt.trim() && !loading && hasRequiredKey;

  return (
    <>
      <div
        className={`p-3 sm:p-4 border-t ${
          isDarkTheme
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        {/* Image Model Suggestion Popup */}
        {showImageSuggestion && (
          <div className={`mb-3 p-3 rounded-lg border-l-4 ${
            isDarkTheme
              ? "bg-blue-500/10 border-blue-500 text-blue-300"
              : "bg-blue-50 border-blue-500 text-blue-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Want to generate an image?
                </span>
                <button
                  onClick={handleSwitchToImageModel}
                  className={`text-sm underline hover:no-underline cursor-pointer ${
                    isDarkTheme ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Switch to GPT-Image-1
                </button>
              </div>
              <button
                onClick={handleDismissImageSuggestion}
                className={`p-1 rounded hover:bg-black/10 ${
                  isDarkTheme ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-500"
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <div className="relative sm:flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-200 ease-out w-full sm:w-auto ${
                isDarkTheme
                  ? "bg-gradient-to-r from-gray-700 to-gray-650 hover:from-gray-600 hover:to-gray-550 text-white border border-gray-600 hover:border-gray-500"
                  : "bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkTheme
                  ? "focus:ring-offset-gray-800"
                  : "focus:ring-offset-white"
              } sm:min-w-[180px] touch-manipulation`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedModel === "autopick" ? (
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isDarkTheme ? "bg-blue-500/20" : "bg-blue-500/10"
                        }`}
                      >
                        <SelectedIcon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-medium text-sm">AutoPick</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProviderIcon
                          model={selectedModel}
                          className="w-6 h-6"
                        />
                        {isImageModel && !hasRequiredKey && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {AI_MODELS.find((model) => model.id === selectedModel)
                          ?.name || selectedModel}
                      </span>
                    </div>
                  )}
                </div>

                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  } ${
                    isDarkTheme ? "text-gray-400" : "text-gray-500"
                  } flex-shrink-0`}
                />
              </div>
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute z-50 bottom-full mb-2 w-full sm:min-w-[320px] rounded-xl shadow-2xl border backdrop-blur-sm ${
                  isDarkTheme
                    ? "bg-gray-800/95 border-gray-600"
                    : "bg-white/95 border-gray-200"
                } transform origin-bottom transition-all duration-200 ease-out animate-in slide-in-from-bottom-2 max-h-60 overflow-y-auto`}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedModel("autopick");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                      selectedModel === "autopick"
                        ? isDarkTheme
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                        : isDarkTheme
                        ? "hover:bg-gray-700 text-white"
                        : "hover:bg-gray-50 text-gray-900"
                    } group touch-manipulation`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedModel === "autopick"
                          ? isDarkTheme
                            ? "bg-blue-500/30"
                            : "bg-blue-100"
                          : isDarkTheme
                          ? "bg-gray-600 group-hover:bg-gray-500"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <AUTOPICK_MODEL.icon
                        className={`w-4 h-4 ${
                          selectedModel === "autopick"
                            ? "text-blue-500"
                            : isDarkTheme
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">
                        {AUTOPICK_MODEL.name}
                      </div>
                      <div
                        className={`text-xs ${
                          selectedModel === "autopick"
                            ? isDarkTheme
                              ? "text-blue-300"
                              : "text-blue-500"
                            : isDarkTheme
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {AUTOPICK_MODEL.description}
                      </div>
                    </div>
                  </button>

                  {AI_MODELS.map((model) => {
                    const modelInfo = getModelInfo(model.id);
                    const ModelIcon = modelInfo.icon;
                    const isSelected = selectedModel === model.id;
                    const isImageGenModel = isImageGenerationModel(model.id);
                    const modelHasKey = isImageGenModel
                      ? hasBYOKKey(getProviderFromModelId(model.id))
                      : true;

                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                          isSelected
                            ? isDarkTheme
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                            : isDarkTheme
                            ? "hover:bg-gray-700 text-white"
                            : "hover:bg-gray-50 text-gray-900"
                        } group touch-manipulation`}
                      >
                        <div className="relative">
                          {model.logoPath && (
                            <ProviderIcon
                              model={model.id}
                              className="w-8 h-8"
                            />
                          )}
                          {isImageGenModel && !modelHasKey && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {model.name}
                            </span>
                            {isImageGenModel && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  isDarkTheme
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                BYOK
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs ${
                              isSelected
                                ? isDarkTheme
                                  ? "text-blue-300"
                                  : "text-blue-500"
                                : isDarkTheme
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {modelInfo.description}
                            {isImageGenModel && !modelHasKey && (
                              <span className="block text-red-500 mt-1">
                                API key required
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isImageModel && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDarkTheme
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkTheme
                  ? "focus:ring-offset-gray-800"
                  : "focus:ring-offset-gray-50"
              } touch-manipulation flex-shrink-0`}
              title="API Key Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  isImageModel && !hasRequiredKey
                    ? "Configure API key in settings to generate images..."
                    : "Type your message..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && canSendMessage && handleSendMessage()
                }
                disabled={isImageModel && !hasRequiredKey}
                className={`w-full px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                  isDarkTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:bg-gray-650"
                    : "bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:bg-gray-50"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md touch-manipulation ${
                  isImageModel && !hasRequiredKey
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              />
              {isImageModel && !hasRequiredKey && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!canSendMessage}
              className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                !canSendMessage
                  ? isDarkTheme
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isDarkTheme
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-xl"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkTheme
                  ? "focus:ring-offset-gray-800"
                  : "focus:ring-offset-gray-50"
              } ${
                loading
                  ? ""
                  : canSendMessage
                  ? "hover:scale-105 active:scale-95"
                  : ""
              } touch-manipulation flex-shrink-0`}
            >
              {loading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
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
              )}
            </button>
          </div>
        </div>

        {isImageModel && !hasRequiredKey && (
          <div
            className={`mt-3 p-3 rounded-lg border ${
              isDarkTheme
                ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                : "bg-orange-50 border-orange-200 text-orange-800"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span>
                <strong>API Key Required:</strong> Configure your OpenAI API key
                in settings to use image generation.
              </span>
            </div>
          </div>
        )}
      </div>

      <BYOKSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkTheme={isDarkTheme}
        onKeyUpdated={handleKeyUpdated}
      />
    </>
  );
}
