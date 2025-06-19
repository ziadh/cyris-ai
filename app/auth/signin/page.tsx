/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Github, Chrome, Moon, Sun } from "lucide-react";

function SignInContent() {
  const [providers, setProviders] = useState<any>(null);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean | null>(null);
  const [hasLocalChats, setHasLocalChats] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();

    // Load saved theme preference or fall back to system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      setIsDarkTheme(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
    }

    // Check if user has local chats
    const localChats = localStorage.getItem("cyrisUserChats");
    if (localChats) {
      try {
        const parsedChats = JSON.parse(localChats);
        setHasLocalChats(Array.isArray(parsedChats) && parsedChats.length > 0);
      } catch (error) {
        console.error("Error parsing local chats:", error);
      }
    }
  }, []);

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "github":
        return <Github className="w-5 h-5" />;
      case "google":
        return <Chrome className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Show minimal loading screen while determining theme
  if (isDarkTheme === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center min-h-screen relative ${
      isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    }`}>
      {/* Header with branding and theme toggle */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Cyris AI" className="w-8 h-8 rounded-lg" />
          <h1 className="text-lg font-semibold">Cyris AI</h1>
        </div>
        <button
          onClick={() => setIsDarkTheme(prev => {
            const newTheme = !prev;
            localStorage.setItem("theme", newTheme ? "dark" : "light");
            return newTheme;
          })}
          className={`p-2 rounded-lg ${
            isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          {isDarkTheme ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <img src="/icon.png" alt="Cyris AI" className="w-16 h-16 rounded-xl" />
        <h2 className="text-xl font-semibold text-center">
          Welcome to Cyris AI
        </h2>
        <div className="text-center">
          <p className="text-gray-400 mb-2">
            Sign in to access your intelligent AI conversations and chat history
          </p>
          {hasLocalChats && (
            <p className={`text-sm px-3 py-2 rounded-lg ${
              isDarkTheme ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-600"
            }`}>
              ✨ Your local conversations will be automatically saved to your account
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <button
                key={provider.name}
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg w-full ${
                  isDarkTheme 
                    ? "bg-gray-800 hover:bg-gray-700" 
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {getProviderIcon(provider.id)}
                <span>Continue with {provider.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
