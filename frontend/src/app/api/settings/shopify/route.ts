import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";
const PROFILES = [".hermes-storeops", ".hermes-marketing", ".hermes-customer"];

// GET /api/settings/shopify — Read current Shopify config
export async function GET() {
  const configPath = path.join(PROJECT_DIR, ".hermes-storeops", "config.yaml");

  if (!fs.existsSync(configPath)) {
    return NextResponse.json({ configured: false });
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const config = yaml.load(content) as Record<string, unknown>;
    const mcpServers = config?.mcp_servers as Record<string, unknown> | undefined;
    const shopify = mcpServers?.shopify as Record<string, unknown> | undefined;
    const env = shopify?.env as Record<string, string> | undefined;

    if (!shopify) {
      return NextResponse.json({ configured: false });
    }

    return NextResponse.json({
      configured: true,
      storeDomain: env?.SHOPIFY_STORE_DOMAIN || "",
      clientId: env?.SHOPIFY_CLIENT_ID || "",
      hasSecret: !!env?.SHOPIFY_CLIENT_SECRET,
    });
  } catch {
    return NextResponse.json({ configured: false });
  }
}

// PUT /api/settings/shopify — Save Shopify credentials
export async function PUT(req: NextRequest) {
  const { storeDomain, clientId, clientSecret } = await req.json();

  if (!storeDomain || !clientId || !clientSecret) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Test connection first
  try {
    const testUrl = `https://${storeDomain}/admin/api/2026-04/products.json?limit=1`;
    const testRes = await fetch(testUrl, {
      headers: {
        "X-Shopify-Access-Token": clientSecret,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!testRes.ok) {
      return NextResponse.json({
        error: `Shopify connection failed: ${testRes.status}. Check your credentials.`,
      }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Cannot reach Shopify: ${message}` }, { status: 400 });
  }

  // Save to all 3 profiles
  const mcpConfig = {
    shopify: {
      command: "npx",
      args: ["@den.dance/shopify-mcp-pro"],
      env: {
        SHOPIFY_STORE_DOMAIN: storeDomain,
        SHOPIFY_CLIENT_ID: clientId,
        SHOPIFY_CLIENT_SECRET: clientSecret,
        SHOPIFY_API_VERSION: "2026-04",
      },
    },
  };

  let saved = 0;
  for (const profile of PROFILES) {
    const configPath = path.join(PROJECT_DIR, profile, "config.yaml");
    if (!fs.existsSync(configPath)) continue;

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      const config = (yaml.load(content) as Record<string, unknown>) || {};
      config.mcp_servers = mcpConfig;
      const newYaml = yaml.dump(config, { lineWidth: 120 });
      fs.writeFileSync(configPath, newYaml, "utf-8");
      saved++;
    } catch {}
  }

  // Also save to .env files
  for (const profile of PROFILES) {
    const envPath = path.join(PROJECT_DIR, profile, ".env");
    if (!fs.existsSync(envPath)) continue;

    let envContent = fs.readFileSync(envPath, "utf-8");
    envContent = envContent.replace(/^SHOPIFY_.*$/gm, "");
    envContent += `\nSHOPIFY_STORE_DOMAIN=${storeDomain}\n`;
    envContent += `SHOPIFY_CLIENT_ID=${clientId}\n`;
    envContent += `SHOPIFY_CLIENT_SECRET=${clientSecret}\n`;
    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
  }

  return NextResponse.json({
    success: true,
    message: `Shopify connected to ${saved} profiles. Restart gateways to apply.`,
    storeDomain,
  });
}

// POST /api/settings/shopify/test — Test connection without saving
export async function POST(req: NextRequest) {
  const { storeDomain, clientSecret } = await req.json();

  try {
    const testUrl = `https://${storeDomain}/admin/api/2026-04/products.json?limit=1`;
    const testRes = await fetch(testUrl, {
      headers: {
        "X-Shopify-Access-Token": clientSecret,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (testRes.ok) {
      const data = await testRes.json();
      return NextResponse.json({
        success: true,
        message: `Connected! Found ${data.products?.length || 0} products.`,
        productCount: data.products?.length || 0,
      });
    }
    return NextResponse.json({ error: `Connection failed: ${testRes.status}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Cannot reach store: ${message}` }, { status: 400 });
  }
}
