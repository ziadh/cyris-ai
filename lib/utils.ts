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
