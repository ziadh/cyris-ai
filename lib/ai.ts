"use server"
import OpenAI from "openai";
import { ROUTER_SYSTEM_PROMPT, AI_MODELS } from "./constants";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.PUBLIC_API_URL,
    'X-Title': 'Cyris AI',
  },
})

export async function getBestModel(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: AI_MODELS.find(model => model.id === "openai/gpt-4o-mini")?.id || "openai/gpt-4o-mini", // Fallback to hardcoded if not found
    messages: [
      {
        role: "system", content: ROUTER_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  console.log(`Response: ${completion.choices[0].message.content}`);
  
  return completion.choices[0].message.content;
}
