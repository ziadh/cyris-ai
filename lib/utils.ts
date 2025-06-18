// Utility function to parse routing format
interface RouteInfo {
  isRouting: boolean;
  prompt: string;
  model?: string; // model is optional when not routing
}

export function parseRoutePrompt(content: string): RouteInfo {
  const match = content.match(
    /<routePrompt prompt\s*=\s*"([^"]*)" model\s*=\s*"([^"]*)"\s*\/>/
  );
  if (match) {
    return {
      isRouting: true,
      prompt: match[1],
      model: match[2], // model is a string when routing
    };
  }
  return { isRouting: false, prompt: "", model: undefined }; // model is undefined when not routing
}

// Utility function to detect if content contains HTML
export function isHtmlContent(content: string): boolean {
  // Check for common HTML tags that indicate formatted content
  const htmlTags = /<(h[1-6]|p|ul|ol|li|pre|code|blockquote|strong|em|br)\b[^>]*>/i;
  return htmlTags.test(content);
}

// Utility function to detect if content contains Markdown
export function isMarkdownContent(content: string): boolean {
  // Check for common Markdown syntax patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers: # ## ###
    /```[\s\S]*?```/,        // Code blocks
    /`[^`]+`/,               // Inline code
    /^\s*[-*+]\s+/m,         // Unordered lists
    /^\s*\d+\.\s+/m,         // Ordered lists
    /^\s*>\s+/m,             // Blockquotes
    /\*\*[^*]+\*\*/,         // Bold text
    /\*[^*]+\*/,             // Italic text
    /_[^_]+_/,               // Alternative italic
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
}

// BYOK (Bring Your Own Key) utilities for secure API key storage
const ENCRYPTION_KEY = 'cyris-ai-byok-key';

// Simple encryption function for localStorage (not for production-grade security)
export function encryptKey(apiKey: string): string {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    
    // Simple XOR encryption with a fixed key (for basic obfuscation)
    const keyData = encoder.encode(ENCRYPTION_KEY);
    const encrypted = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyData[i % keyData.length];
    }
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Error encrypting key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

// Simple decryption function for localStorage
export function decryptKey(encryptedKey: string): string {
  try {
    // Convert from base64
    const encrypted = new Uint8Array(
      atob(encryptedKey)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encrypted.length);
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyData[i % keyData.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Error decrypting key:', error);
    throw new Error('Failed to decrypt API key');
  }
}

// BYOK key management functions
export function saveBYOKKey(provider: string, apiKey: string): void {
  try {
    const encryptedKey = encryptKey(apiKey);
    localStorage.setItem(`byok-${provider}`, encryptedKey);
  } catch (error) {
    console.error('Error saving BYOK key:', error);
    throw new Error('Failed to save API key');
  }
}

export function getBYOKKey(provider: string): string | null {
  try {
    const encryptedKey = localStorage.getItem(`byok-${provider}`);
    if (!encryptedKey) return null;
    
    return decryptKey(encryptedKey);
  } catch (error) {
    console.error('Error retrieving BYOK key:', error);
    return null;
  }
}

export function removeBYOKKey(provider: string): void {
  localStorage.removeItem(`byok-${provider}`);
}

export function hasBYOKKey(provider: string): boolean {
  return localStorage.getItem(`byok-${provider}`) !== null;
}

// Check if a model requires BYOK
export function isImageGenerationModel(modelId: string): boolean {
  return modelId === 'openai/gpt-image-1';
}

// Get the provider from a model ID for BYOK
export function getProviderFromModelId(modelId: string): string {
  return modelId.split('/')[0];
}
