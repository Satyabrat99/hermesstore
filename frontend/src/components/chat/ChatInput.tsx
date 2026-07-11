"use client";

import { useChatStore } from "@/lib/store";
import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-charcoal">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-ash border border-slate text-snow rounded-full px-4 py-2 text-sm focus:outline-none focus:border-phosphor"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-phosphor hover:bg-mint disabled:opacity-50 text-obsidian rounded-full px-4 py-2 font-medium text-sm transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
