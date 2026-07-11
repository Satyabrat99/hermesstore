import { NextRequest, NextResponse } from "next/server";

const HERMES_URL = process.env.NEXT_PUBLIC_HERMES_URL || "http://localhost:8642";

async function proxyRequest(request: NextRequest, path: string) {
  const targetUrl = `${HERMES_URL}/${path}`;

  // Build headers — strip Origin to avoid 403 from Hermes gateway
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "origin" && lower !== "host" && lower !== "connection") {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined,
  };

  const response = await fetch(targetUrl, init);

  // Forward response headers (strip hop-by-hop headers)
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "transfer-encoding" && lower !== "connection") {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}
