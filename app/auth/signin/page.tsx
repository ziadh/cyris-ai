/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";

import { Github, Chrome, Moon, Sun } from "lucide-react";

function SignInContent() {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative">
      {/* Header with branding and theme toggle */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Atlas AI" className="w-8 h-8 rounded-lg" />
          <h1 className="text-lg font-semibold">Cyris AI</h1>
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <img src="/icon.png" alt="Atlas AI" className="w-16 h-16 rounded-xl" />
      </div>
      Welcome to Atlas AI Sign in to access your intelligent AI conversations
      and chat history
      {providers &&
        Object.values(providers).map((provider: any) => (
          <button
            key={provider.name}
            className="w-full"
            onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          >
            {getProviderIcon(provider.id)}
            <span className="ml-2">Continue with {provider.name}</span>
          </button>
        ))}
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
