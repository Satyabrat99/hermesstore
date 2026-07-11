"use client";

import { useChatStore } from "@/lib/store";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useEffect } from "react";
import { Bot, Wifi, WifiOff } from "lucide-react";

export function ChatSidebar() {
  const { isConnected, checkConnection, isLoading } = useChatStore();

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="flex flex-col h-screen w-[400px] border-r border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-white">HermesStore</span>
        </div>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs text-zinc-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <ChatInput />
    </div>
  );
}
