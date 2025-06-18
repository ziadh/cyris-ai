"use client";
import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, Trash2, AlertTriangle } from "lucide-react";
import {
  saveBYOKKey,
  getBYOKKey,
  removeBYOKKey,
  hasBYOKKey,
} from "@/lib/utils";

interface BYOKSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onKeyUpdated?: () => void;
}

export default function BYOKSettings({
  isOpen,
  onClose,
  isDarkTheme,
  onKeyUpdated,
}: BYOKSettingsProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    if (isOpen) {
      setHasOpenaiKey(hasBYOKKey("openai"));
      setOpenaiKey("");
      setSaveStatus("idle");
    }
  }, [isOpen]);

  const handleSaveOpenaiKey = () => {
    if (!openaiKey.trim()) return;

    setSaveStatus("saving");
    try {
      saveBYOKKey("openai", openaiKey.trim());
      setHasOpenaiKey(true);
      setOpenaiKey("");
      setShowOpenaiKey(false);
      setSaveStatus("saved");
      onKeyUpdated?.();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving OpenAI key:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleRemoveOpenaiKey = () => {
    try {
      removeBYOKKey("openai");
      setHasOpenaiKey(false);
      setOpenaiKey("");
      setSaveStatus("idle");
      onKeyUpdated?.();
    } catch (error) {
      console.error("Error removing OpenAI key:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl border ${
          isDarkTheme
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-200"
        } max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`p-6 border-b ${
            isDarkTheme ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDarkTheme ? "bg-blue-500/20" : "bg-blue-100"
              }`}
            >
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">API Key Settings</h2>
              <p
                className={`text-sm ${
                  isDarkTheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage your API keys for image generation
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div
            className={`p-4 rounded-lg border ${
              isDarkTheme
                ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Bring Your Own Key (BYOK)</p>
                <p>
                  Image generation requires your own OpenAI API key. Keys are
                  encrypted and stored locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">OpenAI API Key</h3>
              {hasOpenaiKey && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkTheme
                      ? "bg-green-500/20 text-green-400"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  Configured
                </span>
              )}
            </div>

            {hasOpenaiKey ? (
              <div
                className={`p-4 rounded-lg border ${
                  isDarkTheme
                    ? "border-gray-600 bg-gray-700/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">
                      API Key Configured
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveOpenaiKey}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkTheme
                        ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        : "hover:bg-red-50 text-red-600 hover:text-red-700"
                    }`}
                    title="Remove API key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Your OpenAI API key is securely stored and ready for image
                  generation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showOpenaiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className={`w-full px-3 py-3 pr-12 rounded-lg border text-sm ${
                      isDarkTheme
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                      isDarkTheme ? "hover:bg-gray-600" : "hover:bg-gray-100"
                    }`}
                  >
                    {showOpenaiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSaveOpenaiKey}
                  disabled={!openaiKey.trim() || saveStatus === "saving"}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    !openaiKey.trim() || saveStatus === "saving"
                      ? isDarkTheme
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : saveStatus === "saved"
                      ? isDarkTheme
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      : saveStatus === "error"
                      ? isDarkTheme
                        ? "bg-red-600 text-white"
                        : "bg-red-500 text-white"
                      : isDarkTheme
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {saveStatus === "saving" && (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {saveStatus === "saved" && <span>Saved!</span>}
                  {saveStatus === "error" && <span>Error</span>}
                  {saveStatus === "idle" && (
                    <>
                      <Save className="w-4 h-4" />
                      Save API Key
                    </>
                  )}
                </button>

                <p
                  className={`text-xs ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`p-6 border-t ${
            isDarkTheme ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
