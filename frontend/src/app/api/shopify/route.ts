import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STORE = "hermes-mystore.myshopify.com";
const TOKEN = "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";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint") || "products.json";
  const limit = url.searchParams.get("limit") || "20";

  try {
    const res = await fetch(`https://${STORE}/admin/api/2026-04/${endpoint}?limit=${limit}`, {
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Shopify API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = body.endpoint || "products.json";

    const res = await fetch(`https://${STORE}/admin/api/2026-04/${endpoint}`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
