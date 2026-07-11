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
