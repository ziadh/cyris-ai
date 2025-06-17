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
