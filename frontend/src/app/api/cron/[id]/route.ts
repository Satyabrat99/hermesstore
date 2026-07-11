import { NextRequest, NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-key-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-key-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-key-32c" },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action, department } = await req.json();
  const profile = PROFILES[department];

  if (!profile) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  const endpoints: Record<string, { path: string; method: string }> = {
    pause: { path: `/api/jobs/${id}/pause`, method: "POST" },
    resume: { path: `/api/jobs/${id}/resume`, method: "POST" },
    run: { path: `/api/jobs/${id}/run`, method: "POST" },
    delete: { path: `/api/jobs/${id}`, method: "DELETE" },
  };

  const endpoint = endpoints[action];
  if (!endpoint) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const res = await fetch(`http://127.0.0.1:${profile.port}${endpoint.path}`, {
      method: endpoint.method,
      headers: { Authorization: `Bearer ${profile.key}` },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
