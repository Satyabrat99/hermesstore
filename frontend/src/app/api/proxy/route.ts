import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GATEWAYS: Record<string, number> = {
  brain: 8642,
  storeops: 8643,
  marketing: 8644,
  customer: 8645,
};

// GET/POST/DELETE /api/proxy?dept=storeops&path=/api/jobs
export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export async function DELETE(req: NextRequest) {
  return proxy(req);
}

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const dept = url.searchParams.get("dept");
  const path = url.searchParams.get("path") || "/";

  if (!dept || !GATEWAYS[dept]) {
    return NextResponse.json({ error: "Missing or invalid dept param" }, { status: 400 });
  }

  const port = GATEWAYS[dept];
  const targetUrl = `http://127.0.0.1:${port}${path}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  headers.set("Content-Type", "application/json");

  try {
    const body = req.method !== "GET" && req.method !== "DELETE"
      ? await req.text()
      : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
