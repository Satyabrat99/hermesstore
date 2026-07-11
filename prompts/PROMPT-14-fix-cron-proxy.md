# PROMPT 14: Fix Cron Persistence + Frontend Proxy

> Feed this to Command Code. This fixes two critical bugs.

---

## Bug 1: Cron jobs disappear when gateway restarts

**Root cause:** Jobs were created via HTTP API (`POST /api/jobs`) which stores them in memory only. They need to be created via the Hermes CLI (`hermes cron add`) which persists them to the profile's database.

**Fix:** Create a script that uses `hermes cron add` CLI commands to create all 11 cron jobs. The CLI writes to the profile's SQLite database, so jobs survive gateway restarts.

Create `C:\Users\satya\HermesStore\scripts\create-cron-jobs-cli.sh`:

```bash
#!/bin/bash
# Create cron jobs using hermes CLI (persists to database)
# Run this ONCE per profile after gateways are started

PROJECT="C:\Users\satya\HermesStore"
HERMES="$PROJECT/hermes-agent/.venv/Scripts/hermes.exe"

create_cron() {
  local profile=$1 name=$2 schedule=$3 prompt=$4
  local home="$PROJECT/.hermes-$profile"
  echo "  Creating: $name ($profile)"
  HERMES_HOME="$home" "$HERMES" cron add \
    --name "$name" \
    --schedule "$schedule" \
    --prompt "$prompt" \
    --deliver local 2>&1 | head -1
}

echo "Creating cron jobs via CLI (persists to database)..."

# Store Ops
create_cron storeops "store-health-monitor" "every 30m" "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies, SEO issues. Generate health score 0-100."
create_cron storeops "competitor-price-monitor" "every 2h" "Search for competitor pricing on top products. Alert if competitor dropped price more than 5%. Recommend pricing action."
create_cron storeops "inventory-tracker" "every 6h" "Check inventory levels. Alert if less than 10 units. Calculate days until stockout."
create_cron storeops "analytics-digest" "0 9 * * *" "Daily analytics: revenue, orders, conversion, top products. Compare with previous day."
create_cron storeops "revenue-tracker" "0 22 * * *" "Reconcile today revenue, refunds, net revenue, margins."

# Marketing
create_cron marketing "social-media-scheduler" "0 9 * * *" "Plan today social content: 2-3 products, platform-specific posts, hashtags. Save as drafts."
create_cron marketing "engagement-responder" "every 30m" "Check new comments and DMs. Draft replies matching brand voice. Flag negatives for review."
create_cron marketing "content-calendar" "0 8 * * 1" "Plan week content: themes, topics, products, posting schedule."

# Customer
create_cron customer "support-watcher" "every 15m" "Check new support messages. Categorize and draft responses. Escalate low confidence."
create_cron customer "review-manager" "0 10 * * *" "Check new reviews. Analyze sentiment. Draft replies."
create_cron customer "brand-audit" "0 12 * * 1" "Audit week content for brand voice consistency."

# Pause all (user enables from UI)
echo ""
echo "Pausing all jobs..."
for profile in storeops marketing customer; do
  home="$PROJECT/.hermes-$profile"
  HERMES_HOME="$home" "$HERMES" cron pause --all 2>&1 | head -1
done

echo ""
echo "Done! Jobs persisted to database. They survive gateway restarts."
```

Also create `C:\Users\satya\HermesStore\scripts\create-cron-jobs-cli.ps1` (PowerShell version):

```powershell
# Create cron jobs using hermes CLI (persists to database)

$PROJECT = "C:\Users\satya\HermesStore"
$HERMES = "$PROJECT\hermes-agent\.venv\Scripts\hermes.exe"

function Create-Cron {
    param($Profile, $Name, $Schedule, $Prompt)
    $home = "$PROJECT\.hermes-$Profile"
    Write-Host "  Creating: $Name ($Profile)" -ForegroundColor Gray
    $env:HERMES_HOME = $home
    & $HERMES cron add --name $Name --schedule $Schedule --prompt $Prompt --deliver local 2>&1 | Out-Null
}

Write-Host "Creating cron jobs via CLI (persists to database)..." -ForegroundColor Cyan

# Store Ops
Create-Cron storeops "store-health-monitor" "every 30m" "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies, SEO issues. Generate health score 0-100."
Create-Cron storeops "competitor-price-monitor" "every 2h" "Search for competitor pricing on top products. Alert if competitor dropped price more than 5%. Recommend pricing action."
Create-Cron storeops "inventory-tracker" "every 6h" "Check inventory levels. Alert if less than 10 units. Calculate days until stockout."
Create-Cron storeops "analytics-digest" "0 9 * * *" "Daily analytics: revenue, orders, conversion, top products. Compare with previous day."
Create-Cron storeops "revenue-tracker" "0 22 * * *" "Reconcile today revenue, refunds, net revenue, margins."

# Marketing
Create-Cron marketing "social-media-scheduler" "0 9 * * *" "Plan today social content: 2-3 products, platform-specific posts, hashtags. Save as drafts."
Create-Cron marketing "engagement-responder" "every 30m" "Check new comments and DMs. Draft replies matching brand voice. Flag negatives for review."
Create-Cron marketing "content-calendar" "0 8 * * 1" "Plan week content: themes, topics, products, posting schedule."

# Customer
Create-Cron customer "support-watcher" "every 15m" "Check new support messages. Categorize and draft responses. Escalate low confidence."
Create-Cron customer "review-manager" "0 10 * * *" "Check new reviews. Analyze sentiment. Draft replies."
Create-Cron customer "brand-audit" "0 12 * * 1" "Audit week content for brand voice consistency."

# Pause all
Write-Host ""
Write-Host "Pausing all jobs..." -ForegroundColor Yellow
foreach ($profile in @("storeops", "marketing", "customer")) {
    $home = "$PROJECT\.hermes-$profile"
    $env:HERMES_HOME = $home
    & $HERMES cron pause --all 2>&1 | Out-Null
    Write-Host "  Paused all $profile jobs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done! Jobs persisted to database. They survive gateway restarts." -ForegroundColor Green
```

## Bug 2: Frontend can't fetch cron jobs from gateways (proxy returns 404)

**Root cause:** Next.js API routes at `/api/proxy` are returning 404 instead of proxying to the gateways. The issue is likely a routing conflict with Next.js's internal handling.

**Fix:** Instead of using Next.js API routes as a proxy, configure the Hermes gateways to accept CORS requests from `http://localhost:3000`. Then the frontend can fetch directly from the gateways.

### Step 1: Add CORS to each profile's config.yaml

Update `C:\Users\satya\HermesStore\.hermes-brain\config.yaml` — add this section:

```yaml
api_server:
  enabled: true
  key: hermesstore-brain-2026-secret-key-32c
  port: 8642
  host: 127.0.0.1
  cors_origins:
    - "http://localhost:3000"
    - "http://127.0.0.1:3000"
```

Do the same for all 4 profiles (brain, storeops, marketing, customer) — add `cors_origins` to their `api_server` section.

### Step 2: Update the cron page to fetch directly from gateways

Update `C:\Users\satya\HermesStore\frontend\src\app\cron\page.tsx`:

Replace the `proxyFetch` function with direct gateway fetches:

```typescript
const GATEWAYS: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-32c" },
};

const gatewayFetch = async (dept: string, path: string, options?: RequestInit) => {
  const config = GATEWAYS[dept];
  if (!config) throw new Error(`Unknown department: ${dept}`);
  return fetch(`http://127.0.0.1:${config.port}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};
```

Then use `gatewayFetch` instead of `proxyFetch` throughout the component.

### Step 3: Remove the broken proxy API route

Delete `C:\Users\satya\HermesStore\frontend\src\app\api\proxy\route.ts` — it's not needed anymore.

### Step 4: Remove the rewrites from next.config.ts

The `next.config.ts` should be clean — no rewrites needed since the frontend fetches directly from gateways:

```typescript
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "..", "..", "frontend"),
};

export default nextConfig;
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Then test:
1. Start gateways: `powershell -ExecutionPolicy Bypass -File scripts\start-gateways.ps1`
2. Start frontend: `cd frontend && npm run start`
3. Open http://localhost:3000/cron
4. Verify: 11 cron jobs appear with pause/play buttons
5. Restart a gateway, refresh the page — jobs should still be there

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add -A
git commit -m "fix: cron persistence via CLI + CORS for direct gateway fetch"
```
