"use client";
import { useState } from "react";

interface HelpButtonProps {
  onShowOnboarding: () => void;
  isDarkTheme: boolean;
}

export default function HelpButton({ onShowOnboarding, isDarkTheme }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all hover:scale-110 ${
          isDarkTheme 
            ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }`}
        title="Help & Support"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown menu */}
          <div className={`absolute bottom-full right-0 mb-2 w-56 ${
            isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-lg border shadow-lg z-50 overflow-hidden`}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                Help & Support
              </h3>
            </div>
            
            <div className="py-2">
              <button
                onClick={() => {
                  onShowOnboarding();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 ${
                  isDarkTheme 
                    ? "hover:bg-gray-700 text-gray-300" 
                    : "hover:bg-gray-50 text-gray-700"
                } transition-colors`}
              >
                <span className="text-lg">🎯</span>
                <div>
                  <div className="font-medium">Take the Tour</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Learn about Cyris AI features
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  window.open("mailto:support@cyris.ai?subject=Cyris AI Support", "_blank");
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 ${
                  isDarkTheme 
                    ? "hover:bg-gray-700 text-gray-300" 
                    : "hover:bg-gray-50 text-gray-700"
                } transition-colors`}
              >
                <span className="text-lg">✉️</span>
                <div>
                  <div className="font-medium">Contact Support</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Get help from our team
                  </div>
                </div>
              </button>
              
              <div className={`px-4 py-3 text-xs border-t mt-2 ${
                isDarkTheme 
                  ? "border-gray-700 text-gray-400" 
                  : "border-gray-200 text-gray-500"
              }`}>
                <div className="flex items-center justify-between">
                  <span>Cyris AI v1.0</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 