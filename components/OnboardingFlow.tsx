"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProviderIcon from "./ProviderIcon";

interface OnboardingFlowProps {
  isVisible: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

const getOnboardingSteps = (isDarkTheme: boolean) => [
  {
    id: 1,
    title: "⚡ Lightning Fast AI Chat",
    description:
      "Welcome to Cyris AI! We're not just another chat app – we're built for speed and intelligence.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs">✨</span>
            </div>
          </div>
        </div>
        <p
          className="text-center text-gray-700 dark:text-gray-300"
          style={{ color: isDarkTheme ? undefined : "#333333" }}
        >
          Experience conversations at the speed of thought with our optimized AI
          infrastructure.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: "🧠 Smart Auto-Pick Technology",
    description: "Don't know which AI model to use? We've got you covered!",
    content: (
      <div className="space-y-4">
        <div className="flex justify-center items-center space-x-3 mb-4">
          <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg">
            <ProviderIcon model="openai/gpt-4o-mini" className="w-6 h-6" />
            <ProviderIcon
              model="meta-llama/llama-4-scout"
              className="w-6 h-6"
            />
            <ProviderIcon
              model="google/gemini-2.5-flash-preview-05-20"
              className="w-6 h-6"
            />
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-full text-sm">
            <span className="animate-spin">🎯</span>
            <span className="font-medium">Auto-analyzing your query...</span>
          </div>
        </div>
        <p
          className="text-center text-gray-700 dark:text-gray-300 text-sm"
          style={{ color: isDarkTheme ? undefined : "#333333" }}
        >
          Our smart routing picks the perfect AI model for your specific task.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p
            className="text-xs text-blue-700 dark:text-blue-300 text-center"
            style={{ color: isDarkTheme ? undefined : "#1d4ed8" }}
          >
            🔮 <strong>Coming Soon:</strong> Customizable routing rules to train
            the system your way!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "🎨 AI Image Generation",
    description: "Turn your imagination into stunning visuals!",
    content: (
      <div className="space-y-4">
        <div className="relative mx-auto w-48 h-32 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-sm font-medium">
              Your AI-generated
              <br />
              masterpiece here!
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-white/20 backdrop-blur rounded-full px-2 py-1">
            <span className="text-xs text-white">✨ BYOK</span>
          </div>
        </div>
        <p
          className="text-center text-gray-700 dark:text-gray-300 text-sm"
          style={{ color: isDarkTheme ? undefined : "#333333" }}
        >
          Bring Your Own Key (BYOK) for image generation with your preferred
          provider.
        </p>
        <div className="flex justify-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
            <span
              className="text-sm font-medium text-purple-700 dark:text-purple-300"
              style={{ color: isDarkTheme ? undefined : "#7c3aed" }}
            >
              🎭 Unlimited creativity awaits
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "🔗 Share the Magic",
    description: "Share your amazing AI conversations with anyone!",
    content: (
      <div className="space-y-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">📤</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-sm">✅</span>
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p
            className="text-gray-700 dark:text-gray-300 text-sm"
            style={{ color: isDarkTheme ? undefined : "#333333" }}
          >
            Click the share button next to any chat to create a public link
            instantly!
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span
              className="text-gray-600 dark:text-gray-400"
              style={{ color: isDarkTheme ? undefined : "#ffffff" }}
            >
              🔐 Privacy controls
            </span>
            <span
              className="text-gray-600 dark:text-gray-400"
              style={{ color: isDarkTheme ? undefined : "#ffffff" }}
            >
              📱 Easy sharing
            </span>
            <span
              className="text-gray-600 dark:text-gray-400"
              style={{ color: isDarkTheme ? undefined : "#ffffff" }}
            >
              💾 Permanent links
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "🎉 Ready to Chat?",
    description: "You're all set to experience the future of AI conversations!",
    content: (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <span className="text-4xl">🎯</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 animate-ping"></div>
          </div>
        </div>
        <div className="space-y-3">
          <h3
            className="text-lg font-bold text-gray-800 dark:text-gray-200"
            style={{ color: isDarkTheme ? undefined : "#000000" }}
          >
            Your AI adventure starts now!
          </h3>
          <p
            className="text-gray-700 dark:text-gray-300 text-sm"
            style={{ color: isDarkTheme ? undefined : "#333333" }}
          >
            Type your first message and watch the magic happen. Remember, you
            can always revisit this tour from the help menu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <span
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs"
            style={{ color: isDarkTheme ? undefined : "#1d4ed8" }}
          >
            ⚡ Super Fast
          </span>
          <span
            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs"
            style={{ color: isDarkTheme ? undefined : "#15803d" }}
          >
            🧠 Smart Routing
          </span>
          <span
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs"
            style={{ color: isDarkTheme ? undefined : "#7c3aed" }}
          >
            🎨 Image Gen
          </span>
          <span
            className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs"
            style={{ color: isDarkTheme ? undefined : "#0f766e" }}
          >
            🔗 Share Chats
          </span>
        </div>
      </div>
    ),
  },
];

export default function OnboardingFlow({
  isVisible,
  onClose,
  isDarkTheme,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isVisible) return null;

  const onboardingSteps = getOnboardingSteps(isDarkTheme);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md mx-auto ${
          isDarkTheme ? "bg-gray-900" : "bg-white"
        } rounded-2xl shadow-2xl border ${
          isDarkTheme ? "border-gray-700" : "border-gray-200"
        } ${
          isAnimating
            ? "transform scale-95 opacity-50 transition-all duration-300"
            : ""
        }`}
        style={{
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
          willChange: isAnimating ? "transform, opacity" : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Image
              src="/icon.png"
              alt="Cyris AI"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h2
                className="font-bold text-lg text-black dark:text-gray-200"
                style={{ color: isDarkTheme ? undefined : "#000000" }}
              >
                Welcome to Cyris AI
              </h2>
              <p
                className="text-xs text-black dark:text-gray-400"
                style={{ color: isDarkTheme ? undefined : "#000000" }}
              >
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3
              className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2"
              style={{ color: isDarkTheme ? undefined : "#000000" }}
            >
              {step.title}
            </h3>
            <p
              className="text-gray-700 dark:text-gray-400 text-sm mb-6"
              style={{ color: isDarkTheme ? undefined : "#333333" }}
            >
              {step.description}
            </p>
          </div>

          <div
            className="min-h-[200px] flex items-center justify-center"
            style={{ color: isDarkTheme ? undefined : "#333333" }}
          >
            {step.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentStep === 0
                ? "text-gray-400 cursor-not-allowed"
                : isDarkTheme
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-blue-500 w-6"
                    : index < currentStep
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {currentStep === onboardingSteps.length - 1 ? (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Let's Chat! 🚀
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
