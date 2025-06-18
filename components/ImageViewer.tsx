"use client";
import { useState } from 'react';
import { Download, ExternalLink, Copy, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  isDarkTheme: boolean;
}

export default function ImageViewer({ isOpen, onClose, imageUrl, isDarkTheme }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyris-ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 ${isDarkTheme ? 'bg-black/90' : 'bg-black/75'}`} />
      
      {/* Modal content */}
      <div 
        className={`relative max-w-7xl max-h-full w-full h-full flex flex-col ${
          isDarkTheme ? 'bg-gray-900' : 'bg-white'
        } rounded-lg shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with controls */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              🎨 Generated Image
            </span>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              {zoom}%
            </span>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={zoomOut}
              disabled={zoom <= 25}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300 disabled:opacity-50' 
                  : 'hover:bg-gray-200 text-gray-700 disabled:opacity-50'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <button
              onClick={zoomIn}
              disabled={zoom >= 300}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300 disabled:opacity-50' 
                  : 'hover:bg-gray-200 text-gray-700 disabled:opacity-50'
              }`}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={rotate}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <div className={`w-px h-6 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'}`} />
            
            {/* Action buttons */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              } ${copySuccess ? 'text-green-500' : ''}`}
              title={copySuccess ? "Copied!" : "Copy Link"}
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <div className={`w-px h-6 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'}`} />
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Image container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          <div className="flex items-center justify-center min-h-full">
            <img 
              src={imageUrl}
              alt="Generated Image"
              className="max-w-none transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                cursor: zoom > 100 ? 'move' : 'zoom-in'
              }}
              onClick={zoom === 100 ? zoomIn : undefined}
              onDoubleClick={resetView}
            />
          </div>
        </div>
        
        {/* Footer with quick actions */}
        <div className={`p-4 border-t ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <div className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              💡 Double-click to reset view • Click to zoom in
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetView}
                className={`px-3 py-1 rounded text-xs ${
                  isDarkTheme 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } transition-colors`}
              >
                Reset View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 