import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8643/api/jobs", {
      headers: { Authorization: "Bearer hermesstore-storeops-2026-secret-32c" },
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return NextResponse.json({ 
      status: res.status, 
      ok: res.ok,
      jobCount: data.jobs?.length || 0,
      raw: JSON.stringify(data).slice(0, 500)
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message });
  }
}
