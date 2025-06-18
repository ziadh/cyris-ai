"use client";
import { ChevronDown } from "lucide-react";
import ProviderIcon from "./ProviderIcon";
import { useRef } from "react";
import { AI_MODELS, AUTOPICK_MODEL } from "@/lib/constants";

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

// Helper function to get model info from constants
const getModelInfo = (modelId: string) => {
  if (modelId === "autopick") {
    return AUTOPICK_MODEL;
  }
  
  return AI_MODELS.find(model => model.id === modelId) || {
    id: modelId,
    name: modelId,
    description: "AI assistant",
    icon: AUTOPICK_MODEL.icon // fallback icon
  };
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

  return (
    <div
      className={`p-3 sm:p-4 border-t ${
        isDarkTheme
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
        {/* Enhanced Model Picker */}
        <div className="relative sm:flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-200 ease-out w-full sm:w-auto ${
              isDarkTheme
                ? "bg-gradient-to-r from-gray-700 to-gray-650 hover:from-gray-600 hover:to-gray-550 text-white border border-gray-600 hover:border-gray-500"
                : "bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDarkTheme ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
            } sm:min-w-[180px] touch-manipulation`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedModel === "autopick" ? (
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isDarkTheme ? "bg-blue-500/20" : "bg-blue-500/10"
                    }`}>
                      <SelectedIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium text-sm">AutoPick</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <ProviderIcon model={selectedModel} className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-sm">
                      {AI_MODELS.find(model => model.id === selectedModel)?.name || selectedModel}
                    </span>
                  </div>
                )}
              </div>
              
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                } ${isDarkTheme ? "text-gray-400" : "text-gray-500"} flex-shrink-0`}
              />
            </div>
          </button>

          {/* Enhanced Dropdown */}
          {isDropdownOpen && (
            <div
              className={`absolute z-50 bottom-full mb-2 w-full sm:min-w-[320px] rounded-xl shadow-2xl border backdrop-blur-sm ${
                isDarkTheme
                  ? "bg-gray-800/95 border-gray-600"
                  : "bg-white/95 border-gray-200"
              } transform origin-bottom transition-all duration-200 ease-out animate-in slide-in-from-bottom-2 max-h-60 overflow-y-auto`}
            >
              <div className="p-2">
                                 {/* AutoPick Option */}
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
                   <div className={`p-2 rounded-lg transition-colors ${
                     selectedModel === "autopick"
                       ? isDarkTheme ? "bg-blue-500/30" : "bg-blue-100"
                       : isDarkTheme ? "bg-gray-600 group-hover:bg-gray-500" : "bg-gray-100 group-hover:bg-gray-200"
                   }`}>
                     <AUTOPICK_MODEL.icon className={`w-4 h-4 ${
                       selectedModel === "autopick"
                         ? "text-blue-500"
                         : isDarkTheme ? "text-gray-300" : "text-gray-600"
                     }`} />
                   </div>
                   <div className="flex-1 text-left">
                     <div className="font-medium text-sm">{AUTOPICK_MODEL.name}</div>
                     <div className={`text-xs ${
                       selectedModel === "autopick"
                         ? isDarkTheme ? "text-blue-300" : "text-blue-500"
                         : isDarkTheme ? "text-gray-400" : "text-gray-500"
                     }`}>
                       {AUTOPICK_MODEL.description}
                     </div>
                   </div>
                 </button>

                {/* Model Options */}
                {AI_MODELS.map((model) => {
                  const modelInfo = getModelInfo(model.id);
                  const ModelIcon = modelInfo.icon;
                  const isSelected = selectedModel === model.id;
                  
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
                           <ProviderIcon model={model.id} className="w-8 h-8" />
                         )}
                       </div>
                       <div className="flex-1 text-left">
                         <div className="font-medium text-sm">{model.name}</div>
                         <div className={`text-xs ${
                           isSelected
                             ? isDarkTheme ? "text-blue-300" : "text-blue-500"
                             : isDarkTheme ? "text-gray-400" : "text-gray-500"
                         }`}>
                           {modelInfo.description}
                         </div>
                       </div>
                     </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Input and Send Button Container */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Enhanced Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className={`w-full px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                isDarkTheme
                  ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:bg-gray-650"
                  : "bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:bg-gray-50"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md touch-manipulation`}
            />
          </div>

          {/* Enhanced Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={loading || !prompt.trim()}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
              loading || !prompt.trim()
                ? isDarkTheme
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkTheme
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-xl"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDarkTheme ? "focus:ring-offset-gray-800" : "focus:ring-offset-gray-50"
            } ${loading ? "" : "hover:scale-105 active:scale-95"} touch-manipulation flex-shrink-0`}
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
    </div>
  );
}
