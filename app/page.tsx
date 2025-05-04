"use client";
import { useState } from "react";
import { getBestModel } from "@/lib/ai";
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Cyris AI</h1>
      <input
        type="text"
        placeholder="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button disabled={loading} onClick={() => {
        setLoading(true);
        getBestModel(prompt).then((model) => setModel(model || ""));
        setLoading(false);
      }}>Submit</button>
      {loading && <p>Loading...</p>}
      <p>{model}</p>
    </div>
  );
}
