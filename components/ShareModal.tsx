"use client";
import { useState, useEffect } from "react";
import { Share2, Copy, Check, X, ExternalLink, Globe, Lock } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatTitle: string;
  isDarkTheme: boolean;
}

export default function ShareModal({
  isOpen,
  onClose,
  chatId,
  chatTitle,
  isDarkTheme,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if chat is already shared when modal opens
  useEffect(() => {
    if (isOpen && chatId) {
      checkShareStatus();
    }
  }, [isOpen, chatId]);

  // Close modal on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const checkShareStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isShared) {
          setIsShared(true);
          setShareUrl(data.shareUrl);
        }
      }
    } catch (error) {
      console.error('Error checking share status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsShared(true);
        setShareUrl(data.shareUrl);
      } else {
        alert('Failed to share chat');
      }
    } catch (error) {
      console.error('Error sharing chat:', error);
      alert('Failed to share chat');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsShared(false);
        setShareUrl("");
      } else {
        alert('Failed to unshare chat');
      }
    } catch (error) {
      console.error('Error unsharing chat:', error);
      alert('Failed to unshare chat');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const handleOpenInNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm backdrop-brightness-50 transition-all"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-xl transform transition-all ${
          isDarkTheme
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        } mx-auto my-8`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Share Chat</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Chat Title */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
              Chat Title
            </h3>
            <p className="text-sm font-medium truncate">{chatTitle}</p>
          </div>

          {/* Share Status */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {isShared ? (
                <>
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">Private</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isShared 
                ? "Anyone with the link can view this chat" 
                : "Only you can access this chat"
              }
            </p>
          </div>

          {/* Share URL Input (only shown when shared) */}
          {isShared && shareUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={`flex-1 px-3 py-2 text-sm border rounded-md ${
                    isDarkTheme
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1 ${
                    copied
                      ? "bg-green-500 text-white"
                      : isDarkTheme
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isDarkTheme
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isShared ? (
              <button
                onClick={handleUnshare}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {loading ? "Unsharing..." : "Stop Sharing"}
              </button>
            ) : (
              <button
                onClick={handleShare}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {loading ? "Sharing..." : "Create Share Link"}
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDarkTheme
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 