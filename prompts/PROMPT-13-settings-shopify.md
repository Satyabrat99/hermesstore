# PROMPT 13: Functional Settings Page — Add Shopify Store

> Feed this to Command Code. This makes the Settings page actually save Shopify credentials and connect to the store.

---

In C:\Users\satya\HermesStore\frontend, make the Settings page functional: users can enter Shopify credentials, test the connection, and save them to the Hermes profiles.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

There are 4 Hermes profiles running. Each has a config.yaml at:
- C:\Users\satya\HermesStore\.hermes-brain\config.yaml
- C:\Users\satya\HermesStore\.hermes-storeops\config.yaml
- C:\Users\satya\HermesStore\.hermes-marketing\config.yaml
- C:\Users\satya\HermesStore\.hermes-customer\config.yaml

Shopify MCP needs to be added to the storeops, marketing, and customer profiles. The MCP config in config.yaml looks like:

```yaml
mcp_servers:
  shopify:
    command: "npx"
    args: ["@den.dance/shopify-mcp-pro"]
    env:
      SHOPIFY_STORE_DOMAIN: "store-name.myshopify.com"
      SHOPIFY_CLIENT_ID: "xxx"
      SHOPIFY_CLIENT_SECRET: "xxx"
      SHOPIFY_API_VERSION: "2026-04"
```

## What to Build

### 1. Create Shopify settings API route

Create `src/app/api/settings/shopify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

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
    const config = yaml.load(content) as any;
    const shopify = config?.mcp_servers?.shopify;
    
    if (!shopify) {
      return NextResponse.json({ configured: false });
    }

    return NextResponse.json({
      configured: true,
      storeDomain: shopify.env?.SHOPIFY_STORE_DOMAIN || "",
      clientId: shopify.env?.SHOPIFY_CLIENT_ID || "",
      // Never send secret back
      hasSecret: !!shopify.env?.SHOPIFY_CLIENT_SECRET,
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
        error: `Shopify connection failed: ${testRes.status}. Check your credentials.` 
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ 
      error: `Cannot reach Shopify: ${err.message}` 
    }, { status: 400 });
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
      const config = yaml.load(content) as any || {};
      
      // Update mcp_servers
      config.mcp_servers = mcpConfig;
      
      // Write back
      const newYaml = yaml.dump(config, { lineWidth: 120 });
      fs.writeFileSync(configPath, newYaml, "utf-8");
      saved++;
    } catch {
      // skip broken configs
    }
  }

  // Also save to .env files for the gateway process
  for (const profile of PROFILES) {
    const envPath = path.join(PROJECT_DIR, profile, ".env");
    if (!fs.existsSync(envPath)) continue;

    let envContent = fs.readFileSync(envPath, "utf-8");
    
    // Remove old shopify vars
    envContent = envContent.replace(/^SHOPIFY_.*$/gm, "");
    
    // Add new ones
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
    return NextResponse.json({ 
      error: `Connection failed: ${testRes.status}` 
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ 
      error: `Cannot reach store: ${err.message}` 
    }, { status: 400 });
  }
}
```

### 2. Update the Settings page

Update `src/app/settings/page.tsx` to make the Shopify section functional:

Replace the existing Shopify integration section with a form that:
- Shows current connection status (connected/not connected)
- Has input fields for: Store Domain, Client ID, Client Secret (password field)
- Has a "Test Connection" button that calls POST /api/settings/shopify/test
- Has a "Save & Connect" button that calls PUT /api/settings/shopify
- Shows success/error messages after test or save
- After saving, shows "Restart gateways to apply" message

The form should look like:

```
┌─────────────────────────────────────────────────────────┐
│ 🛒 Shopify Connection                                   │
│                                                         │
│ Status: ● Connected to hermesstore-demo.myshopify.com   │
│                                                         │
│ Store Domain: [hermesstore-demo.myshopify.com        ]  │
│ Client ID:    [shpat_xxxxx                            ]  │
│ Client Secret: [••••••••••••••••••••••••••••          ]  │
│                                                         │
│ [Test Connection]  [Save & Connect]                     │
│                                                         │
│ ✅ Connected! Found 5 products.                         │
│ ⚠️ Restart gateways to apply changes.                   │
└─────────────────────────────────────────────────────────┘
```

### 3. Add restart gateways button

Add a section at the bottom of Settings page:

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Gateway Management                                   │
│                                                         │
│ Restart all agent gateways to apply config changes.     │
│                                                         │
│ [Restart All Gateways]                                  │
│                                                         │
│ ⚠️ This will briefly interrupt all agent connections.   │
└─────────────────────────────────────────────────────────┘
```

The "Restart All Gateways" button calls POST /api/gateway/restart which:
1. Kills all 4 gateway processes
2. Starts them again with updated configs
3. Returns success when all 4 are healthy

Create `src/app/api/gateway/restart/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Kill existing gateways on ports 8642-8645
    for (const port of [8642, 8643, 8644, 8645]) {
      try {
        await execAsync(`lsof -ti:${port} | xargs kill`).catch(() => {});
      } catch {}
    }

    await new Promise((r) => setTimeout(r, 2000));

    // Restart each gateway
    const profiles = [
      { name: "brain", home: ".hermes-brain" },
      { name: "storeops", home: ".hermes-storeops" },
      { name: "marketing", home: ".hermes-marketing" },
      { name: "customer", home: ".hermes-customer" },
    ];

    for (const p of profiles) {
      const hermesHome = `C:\\Users\\atya\\HermesStore\\${p.home}`;
      exec(`set HERMES_HOME=${hermesHome} && C:\\Users\\satya\\HermesStore\\hermes-agent\\.venv\\Scripts\\hermes.exe gateway`, 
        { detached: true, stdio: "ignore" }
      ).unref();
    }

    // Wait for them to start
    await new Promise((r) => setTimeout(r, 15000));

    // Health check
    const results = [];
    for (const p of profiles) {
      const port = p.name === "brain" ? 8642 : p.name === "storeops" ? 8643 : p.name === "marketing" ? 8644 : 8645;
      try {
        const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(5000) });
        results.push({ name: p.name, status: res.ok ? "running" : "failed" });
      } catch {
        results.push({ name: p.name, status: "failed" });
      }
    }

    return NextResponse.json({ success: true, agents: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### 4. Install js-yaml dependency

The API routes need `js-yaml` to read/write YAML config files:

```bash
cd C:\Users\satya\HermesStore\frontend
npm install js-yaml
npm install -D @types/js-yaml
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /settings shows functional Shopify connection form
- [ ] "Test Connection" validates credentials against Shopify API
- [ ] "Save & Connect" writes to all 3 profile config.yaml files
- [ ] Shows success/error messages
- [ ] "Restart All Gateways" button works
- [ ] After restart, agents have Shopify MCP available

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: functional settings — Shopify connection, test, save, gateway restart"
```
