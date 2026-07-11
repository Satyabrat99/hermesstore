"use client";

import { Message } from "@/lib/hermes-client";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageItem({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-phosphor/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-phosphor" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? "bg-phosphor text-obsidian"
            : "bg-ash text-snow border border-charcoal"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-snow" />
        </div>
      )}
    </div>
  );
}
