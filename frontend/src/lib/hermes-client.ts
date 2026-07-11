// Always use the Next.js proxy (/hermes/*) to avoid browser CORS.
// The proxy rewrites /hermes/:path* -> http://localhost:8642/:path*.
const BASE = "/hermes";
const HERMES_KEY = process.env.NEXT_PUBLIC_HERMES_KEY || "hermesstore-app-2026-secret-key-32c";

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
    const body = await response.text().catch(() => "");
    throw new Error(`Hermes API error ${response.status}: ${body.slice(0, 200)}`);
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
