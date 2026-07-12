import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_DOMAIN || "hermes-mystore.myshopify.com";
const TOKEN = process.env.SHOPIFY_TOKEN || "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";

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
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Shopify ${res.status}: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
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
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
