import { create } from "zustand";
import { Message, chat, healthCheck } from "./hermes-client";

let msgCounter = 0;

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
      id: `user-${++msgCounter}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    const assistantId = `assistant-${++msgCounter}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    // Add both messages atomically
    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isLoading: true,
    }));

    try {
      const allMessages = get().messages
        .filter((m) => m.content !== "")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      await chat(allMessages, (token) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + token }
              : m
          ),
        }));
      });
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: m.content || `Error: ${err instanceof Error ? err.message : "Connection failed"}`,
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
