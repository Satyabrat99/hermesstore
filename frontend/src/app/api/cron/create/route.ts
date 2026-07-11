import { NextRequest, NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-key-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-key-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-key-32c" },
};

export async function POST(req: NextRequest) {
  const { name, schedule, prompt, department } = await req.json();
  const profile = PROFILES[department];

  if (!profile) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  try {
    const res = await fetch(`http://127.0.0.1:${profile.port}/api/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${profile.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        schedule,
        prompt,
        metadata: { department, enabled: false },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
