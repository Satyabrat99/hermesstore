# HermesStore — Build Guide (What We Learned)

> This document captures every lesson, pitfall, and correct approach from our practice build.
> Feed this to Command Code as context so it builds correctly the first time.

---

## Architecture Overview

```
HermesStore/
├── hermes-agent/              ← Cloned hermes repo + venv
│   └── .venv/Scripts/hermes.exe
├── .hermes-brain/             ← Brain profile (port 8642)
│   ├── config.yaml
│   ├── .env
│   ├── SOUL.md
│   └── skills/orchestrator.md
├── .hermes-storeops/          ← Store Ops profile (port 8643)
│   ├── config.yaml
│   ├── .env
│   ├── SOUL.md
│   └── skills/product-listing.md, pricing-strategy.md, landing-page-builder.md
├── .hermes-marketing/         ← Marketing profile (port 8644)
│   ├── config.yaml
│   ├── .env
│   ├── SOUL.md
│   └── skills/social-media.md, content-creator.md, email-campaign.md
├── .hermes-customer/          ← Customer/Brand profile (port 8645)
│   ├── config.yaml
│   ├── .env
│   ├── SOUL.md
│   └── skills/support-agent.md, brand-guardian.md, copywriter.md
├── frontend/                  ← Next.js 15 app
│   ├── src/app/               ← Pages
│   ├── src/components/        ← UI components
│   ├── src/lib/               ← API client, store, types
│   └── src/app/api/gw/        ← Proxy route to gateways
├── scripts/                   ← Startup + cron scripts
├── skills/                    ← Skill files (source of truth)
└── prompts/                   ← Command Code prompts
```

## Critical Pitfalls (DO NOT REPEAT)

### 1. npm/Tailwind v4 Conflict
```
PROBLEM: create-next-app installs Tailwind v3, but shadcn@latest wants v4.
         npm gets stuck saying "up to date" but packages aren't on disk.

FIX: nuke everything and start clean:
  rm -rf frontend
  mkdir frontend && cd frontend
  npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*" --use-npm
  npx shadcn@latest init -d
  npx shadcn@latest add button card input scroll-area badge separator

DO NOT: Write custom scripts to download packages manually.
DO NOT: Try to fix npm lockfile conflicts. Just nuke and rebuild.
```

### 2. Hermes Profiles vs Global Hermes
```
PROBLEM: Running "hermes gateway" uses the GLOBAL hermes (user's profile).
         The app needs its OWN hermes with separate config/data.

FIX: Each profile has its own HERMES_HOME directory:
  .hermes-brain/    → Brain orchestrator
  .hermes-storeops/ → Store operations
  .hermes-marketing/ → Marketing
  .hermes-customer/ → Customer/Brand

Start with: HERMES_HOME=/path/to/.hermes-storeops ./hermes-agent/.venv/Scripts/hermes.exe gateway

DO NOT: Use "hermes profile create" — that creates profiles in the GLOBAL hermes.
DO NOT: Use the user's ~/.hermes/ directory for the app's agents.
```

### 3. Cron Jobs Lost on Gateway Restart
```
PROBLEM: Jobs created via HTTP API (POST /api/jobs) are stored in MEMORY only.
         When gateway restarts, all jobs are lost.

FIX (Option A): Use hermes CLI to create jobs (persists to SQLite DB):
  HERMES_HOME=.hermes-storeops hermes cron add --name "store-health" --schedule "every 30m" --prompt "..."

FIX (Option B — RECOMMENDED): Template-based approach.
  Store job definitions as hardcoded templates in the frontend UI.
  When user clicks Enable → create job via API (lives in memory).
  Gateway stays running → jobs stay alive.
  If gateway restarts → user re-enables from template cards.
  This is simpler and more reliable.

DO NOT: Rely on HTTP API jobs surviving restarts.
DO NOT: Try to set up Convex/external DB for cron storage.
```

### 4. CORS Blocks Browser → Gateway
```
PROBLEM: Frontend at localhost:3000 can't fetch from localhost:8643 (different port).
         Browser blocks cross-origin requests.

FIX: Create a server-side proxy in Next.js:
  src/app/api/gw/route.ts — accepts {dept, path, method, body}
  Forwards to the correct gateway port with auth header.
  Frontend calls /api/gw instead of direct gateway URLs.

DO NOT: Try to fetch directly from browser to gateway ports.
DO NOT: Use Next.js rewrites (they conflict with API routes).
DO NOT: Use catch-all routes [...path] (type errors in Next.js 15).
```

### 5. Next.js API Routes Return 404
```
PROBLEM: API routes at /api/proxy or /api/gw/[...path] return 404 or HTML.

FIX: Use a simple POST route at /api/gw/route.ts:
  - Accepts JSON body: { dept, path, method, body }
  - Proxies to the correct gateway
  - No catch-all routes, no rewrites, no complexity

DO NOT: Use catch-all routes ([...path]) — they cause type errors.
DO NOT: Use Next.js rewrites for API proxying.
```

### 6. Shopify Credentials
```
PROBLEM: Three different tokens, only ONE works for API calls.

  prtapi_... → Partner API (manages stores/payouts) — NOT for store API
  shpss_...  → Client Secret (app identity) — NOT for API calls
  shpat_...  → Admin API access token — THIS IS WHAT WE NEED

HOW TO GET shpat_:
  1. Create app in Partner dashboard
  2. Set scopes: read_products, write_products, read_orders, write_orders,
     read_customers, write_customers, read_inventory, write_inventory
  3. Install app on dev store:
     https://store.myshopify.com/admin/oauth/install_custom_app?client_id=XXX
  4. Copy the shpat_ token shown after installation (only shown once!)

DO NOT: Use shpss_ or prtapi_ for API calls.
DO NOT: Try to use Client ID as access token.
```

### 7. Hermes Gateway Config
```
PROBLEM: API server doesn't start. "check_web_api_key" warnings.

FIX: config.yaml must have:
  api_server:
    enabled: true
    key: "at-least-32-characters-long-key-here"
    port: 8643
    host: 127.0.0.1

.env must have:
  API_SERVER_ENABLED=true
  API_SERVER_KEY=same-key-as-config
  API_SERVER_PORT=8643
  API_SERVER_HOST=127.0.0.1
  XIAOMI_API_KEY=your-api-key

KEY MUST BE ≥16 CHARACTERS. "hermesstore-dev" (15 chars) fails silently.

For web search: add EXA_API_KEY=... to .env
```

### 8. Hermes Clone in Project
```
PROBLEM: "inbuilt hermes" means the hermes binary is IN the project,
         not using the user's global install.

FIX:
  git clone --depth 1 https://github.com/NousResearch/hermes-agent.git hermes-agent
  cd hermes-agent && python -m venv .venv && source .venv/Scripts/activate && pip install -e .

  Then use: ./hermes-agent/.venv/Scripts/hermes.exe gateway
  With: HERMES_HOME=.hermes-storeops

DO NOT: Use the user's global "hermes" command.
DO NOT: Create profiles in the user's ~/.hermes/ directory.
```

### 9. Frontend Build vs Dev Mode
```
PROBLEM: "npm run dev" has CSS parse error (PostCSS + Tailwind v4).
         "npm run build && npm run start" works fine.

FIX: Always use production mode for testing:
  npm run build && npm run start

DO NOT: Use "npm run dev" — it has known CSS issues with Tailwind v4.
```

### 10. Chat Sidebar Connection
```
PROBLEM: Chat shows "Disconnected" even when gateway is running.

FIX: The hermes-client.ts must use the correct:
  - API key (must match the gateway's .env API_SERVER_KEY)
  - Model name (usually "hermes-agent")
  - Health endpoint (/v1/models not /health)
  - Proxy path (/hermes/... goes through Next.js rewrite to gateway)

The rewrite in next.config.ts:
  { source: "/hermes/:path*", destination: "http://localhost:8642/:path*" }
```

## Correct Build Order

```
STEP 1: Clone hermes-agent + create venv (5 min)
  git clone --depth 1 https://github.com/NousResearch/hermes-agent.git hermes-agent
  cd hermes-agent && python -m venv .venv && pip install -e .

STEP 2: Create 4 profile directories (5 min)
  mkdir -p .hermes-brain .hermes-storeops .hermes-marketing .hermes-customer
  Copy config.yaml, .env, SOUL.md to each (see templates below)

STEP 3: Scaffold frontend (10 min)
  npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*" --use-npm
  cd frontend && npx shadcn@latest init -d
  npx shadcn@latest add button card input scroll-area badge separator
  npm install zustand framer-motion lucide-react clsx tailwind-merge react-markdown remark-gfm

STEP 4: Build frontend pages via Command Code prompts (30 min)
  Feed prompts 1-6 one by one. Verify each with "npm run build".

STEP 5: Start gateways + create cron jobs (10 min)
  powershell -ExecutionPolicy Bypass -File scripts\start-gateways.ps1

STEP 6: Connect Shopify (10 min)
  Get shpat_ token → add to Settings page → test connection

STEP 7: Polish + demo prep (10 min)
  Fix bugs, practice demo flow
```

## Profile Config Templates

### Brain (.hermes-brain/config.yaml)
```yaml
model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-brain-2026-secret-key-32c
  port: 8642
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
mcp_servers: {}
```

### Brain (.hermes-brain/.env)
```
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-brain-2026-secret-key-32c
API_SERVER_PORT=8642
API_SERVER_HOST=127.0.0.1
XIAOMI_API_KEY=<your-xiaomi-api-key>
EXA_API_KEY=<your-exa-api-key>
```

### Store Ops (.hermes-storeops/config.yaml)
```yaml
model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-storeops-2026-secret-32c
  port: 8643
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
  - browser_navigate
  - browser_click
  - browser_type
  - browser_snapshot
  - image_generate
mcp_servers: {}
# shopify:
#   command: "npx"
#   args: ["@den.dance/shopify-mcp-pro"]
#   env:
#     SHOPIFY_STORE_DOMAIN: "hermesstore-demo.myshopify.com"
#     SHOPIFY_CLIENT_ID: "<client-id>"
#     SHOPIFY_CLIENT_SECRET: "<shpat-token>"
#     SHOPIFY_API_VERSION: "2026-04"
```

### Marketing (.hermes-marketing/config.yaml)
Same as Store Ops but port 8644 and key `hermesstore-marketing-2026-secret-32c`

### Customer (.hermes-customer/config.yaml)
Same as Store Ops but port 8645, key `hermesstore-customer-2026-secret-32c`, and fewer tools:
```yaml
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
```

## Proxy Route Template

### src/app/api/gw/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GATEWAYS: Record<string, number> = {
  brain: 8642,
  storeops: 8643,
  marketing: 8644,
  customer: 8645,
};

const API_KEYS: Record<string, string> = {
  brain: "hermesstore-brain-2026-secret-key-32c",
  storeops: "hermesstore-storeops-2026-secret-32c",
  marketing: "hermesstore-marketing-2026-secret-32c",
  customer: "hermesstore-customer-2026-secret-32c",
};

export async function POST(req: NextRequest) {
  const { dept, path, method = "GET", body } = await req.json();
  
  const port = GATEWAYS[dept];
  if (!port) return NextResponse.json({ error: "Unknown dept" }, { status: 400 });

  const url = `http://127.0.0.1:${port}${path}`;
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${API_KEYS[dept]}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

## Gateway Fetch Helper

### src/lib/gateway.ts
```typescript
export async function gatewayFetch(
  dept: string,
  path: string,
  method = "GET",
  body?: Record<string, unknown>
) {
  const res = await fetch("/api/gw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept, path, method, body }),
  });
  return res.json();
}
```

## Startup Script Template

### scripts/start-gateways.ps1
```powershell
$HERMES_BIN = "C:\Users\satya\HermesStore\hermes-agent\.venv\Scripts\hermes.exe"
$PROJECT = "C:\Users\satya\HermesStore"

$DEPTS = @{
    brain    = @{ port = 8642; key = "hermesstore-brain-2026-secret-key-32c" }
    storeops = @{ port = 8643; key = "hermesstore-storeops-2026-secret-32c" }
    marketing = @{ port = 8644; key = "hermesstore-marketing-2026-secret-32c" }
    customer = @{ port = 8645; key = "hermesstore-customer-2026-secret-32c" }
}

foreach ($dept in $DEPTS.Keys) {
    $port = $DEPTS[$dept].port
    $home = "$PROJECT\.hermes-$dept"
    try { Get-Process -Id (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force } catch {}
    $env:HERMES_HOME = $home
    Start-Process -FilePath $HERMES_BIN -ArgumentList "gateway" -WindowStyle Hidden -PassThru | Out-Null
    Write-Host "Started $dept on port $port"
}
Start-Sleep -Seconds 20
```

## Cron Job Templates (11 jobs)

Store Ops (5):
- store-health-monitor: every 30m — Check store health, product descriptions, pricing
- competitor-price-monitor: every 2h — Search competitor pricing, alert if >5% drop
- inventory-tracker: every 6h — Check inventory levels, alert if <10 units
- analytics-digest: 0 9 * * * — Daily revenue, orders, conversion
- revenue-tracker: 0 22 * * * — Reconcile daily revenue

Marketing (3):
- social-media-scheduler: 0 9 * * * — Plan daily social content
- engagement-responder: every 30m — Check comments/DMs, draft replies
- content-calendar: 0 8 * * 1 — Plan weekly content

Customer (3):
- support-watcher: every 15m — Check support messages, draft responses
- review-manager: 0 10 * * * — Check reviews, analyze sentiment
- brand-audit: 0 12 * * 1 — Audit brand voice consistency

## Event-Day Checklist

```
BEFORE EVENT:
├── [ ] Copy prompts/, scripts/, skills/, .hermes-*/, CONTEXT.md to USB
├── [ ] Copy frontend/src/ to USB
├── [ ] Get Shopify shpat_ token
├── [ ] Get Exa API key
├── [ ] Install Wispr Flow
├── [ ] Create Google Form for leads
└── [ ] Verify laptop: node --version, python --version, git --version

AT EVENT:
├── [ ] Clone hermes-agent + venv (5 min)
├── [ ] Create 4 profile directories + copy configs from USB (5 min)
├── [ ] Scaffold frontend + install deps (10 min)
├── [ ] Feed prompts 1-6 to Command Code (30 min)
├── [ ] Start gateways + verify all 4 healthy (5 min)
├── [ ] Connect Shopify + test (10 min)
├── [ ] Polish + fix bugs (10 min)
├── [ ] Practice demo (5 min)
└── [ ] TOTAL: ~80 min

DEMO FLOW:
1. "Hey HermesStore, add Nike Air Max at ₹8,999"
2. "Create an Instagram post for our summer sale"
3. "Draft a reply to a customer asking about shipping"
4. Show cron jobs being created and running
5. Show real Shopify products being managed
6. ₹9 sale hack — collect WhatsApp numbers, send promo
```
