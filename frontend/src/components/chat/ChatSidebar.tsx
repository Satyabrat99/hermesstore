"use client";

import { useChatStore } from "@/lib/store";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useEffect } from "react";
import { Bot, Wifi, WifiOff, LayoutDashboard, Package, Megaphone, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function ChatSidebar() {
  const { isConnected, checkConnection } = useChatStore();
  const pathname = usePathname();

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="fixed inset-y-0 left-0 flex flex-col w-[400px] border-r border-charcoal bg-obsidian z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-phosphor" />
          <span className="font-medium text-snow">HermesStore</span>
        </div>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-phosphor" />
          ) : (
            <WifiOff className="w-4 h-4 text-smoke" />
          )}
          <span className="text-xs text-smoke">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 border-b border-charcoal">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-ash text-snow"
                    : "text-silver hover:text-snow hover:bg-ash/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-phosphor" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <ChatInput />
    </div>
  );
}
