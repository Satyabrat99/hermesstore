const HERMES_URL = process.env.NEXT_PUBLIC_HERMES_URL || "http://localhost:8642";
const HERMES_KEY = process.env.NEXT_PUBLIC_HERMES_KEY || "hermesstore-app-2026-secret-key-32c";

// In dev, requests go through the Next.js rewrite proxy (/hermes/*) to avoid CORS.
// In production with a public Hermes URL, NEXT_PUBLIC_HERMES_URL can be set directly.
const BASE = process.env.NODE_ENV === "development" ? "/hermes" : HERMES_URL;

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
  const response = await fetch(`${BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HERMES_KEY}`,
    },
    body: JSON.stringify({
      model: "hermes-agent",
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
    const res = await fetch(`${BASE}/v1/models`, {
      headers: { Authorization: `Bearer ${HERMES_KEY}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
