"use client";

import { useChatStore } from "@/lib/store";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

export function MessageList() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <p className="text-lg font-medium">Welcome to HermesStore</p>
          <p className="text-sm mt-1">Ask me anything about your store</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
