# HermesStore — Build Roadmap

> **Goal:** Build a working AI ecommerce store manager demo in 8 hours
> **Event:** GrowthX Hermes Buildathon — July 12, Pune
> **Track:** Revenue (show real money flow)
> **Architecture:** Frontend → Hermes API Server (built-in) → Shopify MCP

---

## Architecture Summary

```
┌─────────────────┐     HTTP/SSE      ┌──────────────────────┐     MCP      ┌─────────┐
│   Next.js UI    │ ────────────────▶ │  Hermes API Server   │ ──────────▶  │ Shopify │
│  (shadcn/ui)    │ ◀──────────────── │  localhost:8642       │ ◀──────────  │  Store  │
└─────────────────┘   stream:true     └──────────────────────┘              └─────────┘
                         │
                         │  Built-in endpoints:
                         │  ├── /v1/chat/completions  (OpenAI-compatible chat)
                         │  ├── /api/jobs              (cron job CRUD)
                         │  ├── /api/sessions          (session management)
                         │  ├── /v1/runs/{id}/approval (approval flow)
                         │  └── /health                (health check)
                         │
                         ▼
                  No custom backend needed!
```

**Key insight:** Hermes ships a built-in API server. We write ZERO backend code — just configure a Hermes profile and point the frontend at `http://localhost:8642`.

---

## Pre-Event (Tonight — July 11)

### Objective: Prepare everything so we can START building immediately at the event

```
Time: 2-3 hours tonight
│
├── [1h] PRE-REGISTRATION
│   ├── [15m] Convex: Create account + project 'hermesstore'
│   ├── [15m] Cloudflare: Create account + install Wrangler CLI
│   ├── [15m] Shopify: Create partner account + dev store
│   └── [15m] Wispr Flow: Install + test voice input
│
├── [1h] REPO PREPARATION
│   ├── [15m] Clone all open-source repos (subagents in parallel)
│   ├── [15m] Install frontend dependencies (agno-agi/agent-ui)
│   ├── [15m] Set up Hermes profile 'ecommerce-store'
│   └── [15m] Test Shopify MCP connection
│
├── [30m] DOCUMENTATION
│   ├── [15m] Review all planning docs
│   └── [15m] Print/save demo script + talking points
│
└── [15m] BACKUP PREP
    ├── Record 2-min concept video (even slides)
    └── Save all API keys to .env file
```

---

## Hermes Profile Setup (Pre-Event or Phase 1)

### Create the profile

```bash
# 1. Create the Hermes profile
hermes profile create hermesstore

# 2. Configure environment variables in ~/.hermes/profiles/hermesstore/.env
cat > ~/.hermes/profiles/hermesstore/.env << 'EOF'
# Enable the built-in API server
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-demo-key-2026
API_SERVER_PORT=8642

# Shopify MCP configuration
SHOPIFY_STORE_URL=https://your-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
EOF

# 3. Configure MCP server for Shopify in profile config
# Edit ~/.hermes/profiles/hermesstore/config.yaml
# Add under mcp.servers:
#   shopify:
#     command: npx
#     args: ["-y", "@anthropic/mcp-server-shopify"]
#     env:
#       SHOPIFY_STORE_URL: ${SHOPIFY_STORE_URL}
#       SHOPIFY_ACCESS_TOKEN: ${SHOPIFY_ACCESS_TOKEN}

# 4. Start the gateway (API server + MCP connections)
hermes -p hermesstore gateway

# 5. Verify it's running
curl http://localhost:8642/health
# Expected: {"status":"ok"}

# 6. Test chat endpoint
curl http://localhost:8642/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hermesstore-demo-key-2026" \
  -d '{"model":"default","messages":[{"role":"user","content":"List my Shopify products"}],"stream":true}'
```

### Verify MCP connection

```bash
# Check that Shopify MCP tools are available
curl http://localhost:8642/v1/tools \
  -H "Authorization: Bearer hermesstore-demo-key-2026"
# Should list Shopify MCP tools (search products, create product, etc.)
```

---

## Event Day — July 12 (8 Hours)

### Phase 1: Foundation (Hour 0-0.75) 🔴 CRITICAL

**Objective:** Frontend connected to Hermes API Server — chat working

> ⚡ **Simplified:** No custom API routes, no SSE plumbing, no backend code.
> Just connect Next.js directly to `http://localhost:8642/v1/chat/completions`.

| Task | Time | Owner | Status |
|---|---|---|---|
| Create Hermes profile: `hermes profile create hermesstore` | 15m | — | ⬜ |
| Configure .env: API_SERVER_ENABLED, Shopify MCP | 15m | — | ⬜ |
| Start gateway: `hermes -p hermesstore gateway` | 5m | — | ⬜ |
| Test: `curl http://localhost:8642/health` | 5m | — | ⬜ |
| Frontend scaffold (Next.js + shadcn/ui) | 15m | — | ⬜ |
| Chat page → `http://localhost:8642/v1/chat/completions` | 15m | — | ⬜ |
| **Milestone: "Hello Shopify" in chat** | | | ⬜ |

**Exit Criteria:** Type "list my products" in chat → see products from Shopify

**What we eliminated:**
- ❌ Custom API route to Hermes (built-in `/v1/chat/completions`)
- ❌ Custom SSE streaming (use `stream: true` — OpenAI-compatible)
- ❌ Custom session management (built-in `/api/sessions`)
- ❌ Custom backend server code (zero lines)

---

### Phase 2: Core Store Ops (Hour 0.75-2.75) 🔴 CRITICAL

**Objective:** Product CRUD, pricing, and landing pages via chat

| Task | Time | Status |
|---|---|---|
| Product Lister skill (natural language) | 30m | ⬜ |
| Product Lister skill (voice input) | 15m | ⬜ |
| Pricing Strategist skill | 20m | ⬜ |
| Landing Page Builder skill | 20m | ⬜ |
| Dashboard page (metric cards) | 20m | ⬜ |
| Agent activity feed | 15m | ⬜ |
| Approval flow → `/v1/runs/{id}/approval` | 15m | ⬜ |
| **Milestone: Full chat → product → price → page flow** | | ⬜ |

**Exit Criteria:** "Add Nike Air Max at ₹8,999" → product created with AI description

> **Approval flow:** Hermes has a built-in approval endpoint. Frontend just calls
> `POST /v1/runs/{id}/approval` with `{"approve": true}` — no custom backend needed.

---

### Phase 3: Monitoring Agents (Hour 2.75-4.25) 🟡 IMPORTANT

**Objective:** At least 2 cron agents running and showing alerts

| Task | Time | Status |
|---|---|---|
| Store Health Monitor cron | 20m | ⬜ |
| Competitor Price Monitor cron | 25m | ⬜ |
| Inventory Tracker cron | 15m | ⬜ |
| Analytics Digest cron | 15m | ⬜ |
| Alerts showing in dashboard | 15m | ⬜ |
| **Milestone: Alert pops up in dashboard** | | ⬜ |

**Exit Criteria:** Competitor price change → alert in dashboard → recommendation

> **Cron jobs:** Created via `POST /api/jobs` — Hermes handles scheduling, execution,
> and storage. Frontend reads job status from `/api/jobs/{id}`.

---

### ☕ BREAK (30 min) — Hour 4.25

---

### Phase 4: Marketing (Hour 4.5-5.5) 🟡 IMPORTANT

**Objective:** One marketing action that leads to a sale

| Task | Time | Status |
|---|---|---|
| Social media post generator | 20m | ⬜ |
| Content creator (image gen) | 15m | ⬜ |
| WhatsApp promo message prep | 10m | ⬜ |
| Lead list loaded in Convex/DB | 10m | ⬜ |
| **Milestone: Promo message ready to send** | | ⬜ |

**Exit Criteria:** "Post our top product on Instagram" → carousel generated

---

### Phase 5: UI Polish & ₹9 Sale Demo (Hour 5.5-7) 🟢 EXTRA TIME

**Objective:** Production-quality demo with real transaction

> 🎉 **Bonus time:** We saved ~10 hours by not building a custom backend.
> This phase uses that time for UI polish and a convincing sale demo.

| Task | Time | Status |
|---|---|---|
| Dashboard visual polish (animations, loading states) | 30m | ⬜ |
| Voice commands working (Wispr Flow) | 15m | ⬜ |
| E2E test all demo flows | 20m | ⬜ |
| ₹9 payment link tested end-to-end | 15m | ⬜ |
| Fix critical bugs only | 10m | ⬜ |
| **Milestone: Demo flow runs without errors + real ₹9 sale** | | ⬜ |

---

### Phase 6: Demo Prep (Hour 7-8) 🔴 CRITICAL

**Objective:** Ready to present with backup plan

| Task | Time | Status |
|---|---|---|
| Deploy to Cloudflare | 15m | ⬜ |
| Record backup video | 10m | ⬜ |
| Test ₹9 payment link live | 10m | ⬜ |
| Walk around + collect final WhatsApp numbers | 10m | ⬜ |
| Review talking points | 10m | ⬜ |
| Pre-demo checklist verified | 5m | ⬜ |
| **Milestone: READY TO PRESENT** | | ⬜ |

---

## Escalation Rules

```
IF Phase 1 takes > 1 hour:
  → Hermes profile/API server is probably not the issue
  → CHECK: Is `hermes -p hermesstore gateway` running?
  → CHECK: Is Shopify MCP connected? (curl /v1/tools)
  → SKIP fancy UI, use minimal chat-only interface
  → Focus: Hermes chat + Shopify MCP + 1 demo flow

IF Phase 2 takes > 2.5 hours:
  → SKIP voice input, use text-only
  → SKIP image upload, use natural language only
  → Focus: 1 product creation + 1 pricing + 1 page

IF Phase 3 takes > 2 hours:
  → SKIP cron jobs, trigger agents manually via chat
  → Show "what it would do" with pre-computed output
  → Focus: Chat-based demo only

IF Phase 4 takes > 1.5 hours:
  → SKIP real social media posting
  → Show generated content in dashboard only
  → Focus: "Here's what it would post"

IF behind by 3+ hours:
  → PLAY backup video for the "wow" moments
  → LIVE demo only for chat + Shopify CRUD
  → PITCH the business case + architecture
  → Emphasize: "Zero backend code — Hermes handles everything"
```

---

## Demo Day Checklist (30 min before)

```
PRESENTER:
├── [  ] Laptop charged to 100%
├── [  ] Charger + extension cord ready
├── [  ] WiFi connected + tested (have mobile hotspot backup)
├── [  ] Hermes gateway running: hermes -p hermesstore gateway
├── [  ] curl http://localhost:8642/health → OK
├── [  ] All terminal tabs open + ready
├── [  ] Browser tabs: Shopify admin, Cloudflare dashboard, Convex dashboard
├── [  ] Hermes chat window ready
├── [  ] Demo products loaded in store (5+ products)
├── [  ] Landing page deployed + URL works
├── [  ] WhatsApp message template ready
├── [  ] Dodo/Razorpay payment link tested
├── [  ] Backup video on desktop (ready to play)
├── [  ] Talking points on phone/printed
└── [  ] Deep breath. You've got this.

BACKUP PLAN:
├── [  ] If WiFi fails: mobile hotspot or offline demo video
├── [  ] If demo crashes: switch to backup video
├── [  ] If payments fail: show mock transaction in dashboard
└── [  ] If everything fails: pitch the architecture + vision
```

---

## Post-Event (Same Day)

```
├── [  ] Collect all WhatsApp numbers from form
├── [  ] Send thank-you message to everyone who tested
├── [  ] Post demo video on LinkedIn/Twitter
├── [  ] Update HermesStore project document with lessons learned
├── [  ] Follow up with judges + organizers
└── [  ] Start planning V2 based on feedback
```

---

## Timeline Visualization

```
JULY 11 (Tonight)
├── 6:00 PM  ─── Start pre-registration
├── 7:00 PM  ─── Clone repos + install deps
├── 8:00 PM  ─── Create Hermes profile + test gateway
├── 9:00 PM  ─── Review planning docs
├── 10:00 PM ─── Record backup video
└── 11:00 PM ─── SLEEP (you need it)

JULY 12 (Event Day)
├── 8:00 AM  ─── Arrive, set up, collect numbers
├── 9:00 AM  ─── PHASE 1: Foundation (45 min — start gateway, connect frontend)
├── 9:45 AM  ─── PHASE 2: Core Store Ops (2 hours)
├── 11:45 AM ─── PHASE 3: Monitoring (1.5 hours)
├── 1:15 PM  ─── ☕ LUNCH BREAK
├── 1:45 PM  ─── PHASE 4: Marketing (1 hour)
├── 2:45 PM  ─── PHASE 5: UI Polish + ₹9 Sale Demo (1.5 hours)
├── 4:15 PM  ─── PHASE 6: Demo Prep (1 hour)
├── 5:15 PM  ─── 🎤 DEMO TIME
└── 6:00 PM  ─── 🎉 Celebrate / Network
```

---

## Time Savings Summary

| What we thought we needed | Actual | Saved |
|---|---|---|
| Custom API routes | Hermes built-in `/v1/chat/completions` | ~2h |
| Custom SSE streaming | `stream: true` (OpenAI-compatible) | ~1.5h |
| Custom session management | Hermes built-in `/api/sessions` | ~1h |
| Custom approval flow | Hermes built-in `/v1/runs/{id}/approval` | ~1h |
| Custom cron job CRUD | Hermes built-in `/api/jobs` | ~1h |
| Custom backend server setup | `hermes -p hermesstore gateway` | ~2h |
| **Total saved** | | **~8.5h** |

**Reinvested in:** More UI polish, real ₹9 sale demo, voice commands, and buffer time for debugging.
