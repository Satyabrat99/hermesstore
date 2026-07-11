# PROMPT 1: Scaffold Next.js App + Chat Interface

> Feed this to Command Code. Wait for it to finish, then report back.

---

In C:\Users\satya\HermesStore\frontend, create a Next.js 15 app with a chat interface that connects to a local API server.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md first for full project context.

We're building an AI ecommerce store manager. The frontend is a thin client that talks to Hermes Agent's built-in OpenAI-compatible API server at http://localhost:8642.

## What to Build

### 1. Initialize the Next.js project

```bash
cd C:\Users\satya\HermesStore\frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

If the directory already has files from a previous attempt, clean it first:
```bash
rm -rf * .* 2>/dev/null
```

### 2. Install dependencies

```bash
npm install zustand framer-motion lucide-react clsx tailwind-merge
npx shadcn@latest init -d
npx shadcn@latest add button card input scroll-area badge separator
```

### 3. Create the Hermes API client

Create `src/lib/hermes-client.ts`:

```typescript
const HERMES_URL = process.env.NEXT_PUBLIC_HERMES_URL || "http://localhost:8642";
const HERMES_KEY = process.env.NEXT_PUBLIC_HERMES_KEY || "hermesstore-dev-2026";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export async function chat(
  messages: { role: string; content: string }[],
  onToken: (token: string) => void,
  onToolCall?: (tool: ToolCall) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${HERMES_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HERMES_KEY}`,
    },
    body: JSON.stringify({
      model: "hermesstore",
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Hermes API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.replace("data: ", "").trim();
      if (data === "[DONE]") return fullContent;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          onToken(delta.content);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }
  return fullContent;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${HERMES_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
```

### 4. Create a Zustand store

Create `src/lib/store.ts`:

```typescript
import { create } from "zustand";
import { Message, chat, healthCheck } from "./hermes-client";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  addMessage: (msg: Message) => void;
  sendMessage: (content: string) => Promise<void>;
  checkConnection: () => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isConnected: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  sendMessage: async (content) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }));

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, assistantMsg],
    }));

    try {
      const allMessages = get().messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await chat(allMessages, (token) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + token }
              : m
          ),
        }));
      });
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `Error: ${err instanceof Error ? err.message : "Connection failed"}`,
              }
            : m
        ),
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  checkConnection: async () => {
    const connected = await healthCheck();
    set({ isConnected: connected });
  },

  clearMessages: () => set({ messages: [] }),
}));
```

### 5. Create the Chat components

Create `src/components/chat/ChatSidebar.tsx`:

```tsx
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
```

Create `src/components/chat/MessageList.tsx`:

```tsx
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
```

Create `src/components/chat/MessageItem.tsx`:

```tsx
"use client";

import { Message } from "@/lib/hermes-client";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function MessageItem({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 text-zinc-100"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
```

Create `src/components/chat/ChatInput.tsx`:

```tsx
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
    <div className="p-4 border-t border-zinc-800">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2"
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
```

### 6. Create the main layout with chat sidebar

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HermesStore — AI Ecommerce Manager",
  description: "Manage your entire ecommerce store with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex">
          {children}
        </div>
      </body>
    </html>
  );
}
```

### 7. Create the main page (placeholder dashboard)

Update `src/app/page.tsx`:

```tsx
"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function Home() {
  return (
    <>
      <ChatSidebar />
      <main className="flex-1 p-8 bg-zinc-900 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-zinc-400">Dashboard content coming in next prompt.</p>
      </main>
    </>
  );
}
```

### 8. Update globals.css for dark theme

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #09090b;
  --foreground: #fafafa;
}

body {
  background: var(--background);
  color: var(--foreground);
}

/* Markdown styling */
.prose pre {
  background: #18181b;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.prose code {
  background: #27272a;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}
```

## Verification

After building, run:

```bash
cd C:\Users\satya\HermesStore\frontend
npm run dev
```

Check:
- [ ] App starts on http://localhost:3000 without errors
- [ ] Dark theme is applied
- [ ] Chat sidebar is visible on the left (400px wide)
- [ ] Chat input is at the bottom
- [ ] "Welcome to HermesStore" message appears
- [ ] Connection status shows (Connected/Disconnected — it will show Disconnected since Hermes isn't running, that's OK)

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: scaffold Next.js app with chat interface"
```
