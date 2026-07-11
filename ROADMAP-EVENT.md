# HermesStore — Hackathon Build Roadmap

> **Goal:** Build a working AI ecommerce store manager demo in 6.5 hours
> **Event:** GrowthX Hermes Buildathon — July 12, Pune
> **Track:** Revenue (show real money flow)
> **Architecture:** 4 Hermes profiles → Next.js frontend → Shopify MCP

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                             │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────────┐     │
│  │ Store Ops│ │Marketing │ │ Customer  │ │  Dashboard        │     │
│  │  Tab     │ │  Tab     │ │ Brand Tab │ │  (mock cards)     │     │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └───────────────────┘     │
│       │            │             │                                  │
│       └────────────┼─────────────┘                                  │
│                    ▼                                                │
│          Hermes API Server (localhost:8642)                         │
│                    │                                                │
│       ┌────────────┼────────────┐                                  │
│       ▼            ▼            ▼                                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐                            │
│  │brain    │ │storeops  │ │marketing │                            │
│  │profile  │ │profile   │ │profile   │                            │
│  └─────────┘ └──────────┘ └──────────┘                            │
│       │            │                                               │
│       ▼            ▼                                               │
│  ┌─────────────────────┐                                          │
│  │    Shopify MCP      │                                          │
│  └─────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Key insight:** 4 specialized Hermes profiles, each with its own skills, tools, and personality. Frontend routes requests to the right profile. Zero backend code.

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
│   ├── [15m] Set up Hermes profiles (brain, storeops, marketing, customer-brand)
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

## Hermes Profile Setup

### Create 4 profiles

```bash
# 1. Create all 4 profiles
hermes profile create brain
hermes profile create storeops
hermes profile create marketing
hermes profile create customer-brand

# 2. Configure brain profile (.env + config.yaml)
cat > ~/.hermes/profiles/brain/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-brain-key-2026
API_SERVER_PORT=8642
SHOPIFY_STORE_URL=https://your-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
EOF

# 3. Configure storeops profile
cat > ~/.hermes/profiles/storeops/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-storeops-key-2026
API_SERVER_PORT=8643
SHOPIFY_STORE_URL=https://your-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
EOF

# 4. Configure marketing profile
cat > ~/.hermes/profiles/marketing/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-marketing-key-2026
API_SERVER_PORT=8644
EOF

# 5. Configure customer-brand profile
cat > ~/.hermes/profiles/customer-brand/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-customer-brand-key-2026
API_SERVER_PORT=8645
EOF

# 6. Start all gateways (in separate terminals or background)
hermes -p brain gateway &
hermes -p storeops gateway &
hermes -p marketing gateway &
hermes -p customer-brand gateway &

# 7. Verify all running
curl http://localhost:8642/health  # brain
curl http://localhost:8643/health  # storeops
curl http://localhost:8644/health  # marketing
curl http://localhost:8645/health  # customer-brand

# 8. Test Shopify MCP via brain
curl http://localhost:8642/v1/tools \
  -H "Authorization: Bearer hermesstore-brain-key-2026"
```

---

## Event Day — July 12 (6.5 Hours + Break)

### Phase 1: Foundation (Hour 0-1) 🔴 CRITICAL

**Objective:** 4 profiles created, configured, frontend scaffold, connected to brain

| Task | Time | Status |
|---|---|---|
| Create 4 Hermes profiles | 10m | ⬜ |
| Configure .env for each profile | 15m | ⬜ |
| Start all 4 gateways | 5m | ⬜ |
| Verify health endpoints | 5m | ⬜ |
| Frontend scaffold (Next.js + shadcn/ui) | 15m | ⬜ |
| Chat page → brain profile (localhost:8642) | 10m | ⬜ |
| **Milestone: "Hello Shopify" via brain profile** | | ⬜ |

**Exit Criteria:** Type "list my products" in chat → see products from Shopify via brain profile

---

### Phase 2: Store Ops (Hour 1-3) 🔴 CRITICAL

**Objective:** Product lister, pricing, landing page, inventory cron

| Task | Time | Status |
|---|---|---|
| Product Lister skill (voice + text + image) | 40m | ⬜ |
| Pricing Strategist skill | 20m | ⬜ |
| Landing Page Builder skill | 20m | ⬜ |
| Inventory Tracker cron job | 20m | ⬜ |
| Connect storeops profile to frontend tab | 20m | ⬜ |
| **Milestone: Full chat → product → price → page flow** | | ⬜ |

**Exit Criteria:** "Add Nike Air Max at ₹8,999" → product created with AI description, landing page generated

---

### Phase 3: Marketing (Hour 3-4.5) 🟡 IMPORTANT

**Objective:** Social post gen, content creator, ₹9 promo, engagement cron

| Task | Time | Status |
|---|---|---|
| Social media post generator skill | 25m | ⬜ |
| Content creator (image gen) skill | 20m | ⬜ |
| ₹9 promo campaign setup | 20m | ⬜ |
| Engagement monitoring cron | 15m | ⬜ |
| Connect marketing profile to frontend tab | 15m | ⬜ |
| **Milestone: Social posts generated + promo ready** | | ⬜ |

**Exit Criteria:** "Post our top product on Instagram" → carousel generated + ₹9 promo message ready

---

### ☕ BREAK (30 min) — Hour 4.5

---

### Phase 4: Customer/Brand (Hour 5-6) 🟡 IMPORTANT

**Objective:** Support agent, brand voice, copywriter

| Task | Time | Status |
|---|---|---|
| Customer support agent skill | 20m | ⬜ |
| Brand voice configuration | 10m | ⬜ |
| Copywriter skill (product descriptions) | 15m | ⬜ |
| Connect customer-brand profile to frontend tab | 15m | ⬜ |
| **Milestone: Support chat + brand-consistent copy** | | ⬜ |

**Exit Criteria:** "Help customer with return" → empathetic response + brand-aligned product descriptions

---

### Phase 5: Dashboard + Mock Cards (Hour 6-7) 🟢 POLISH

**Objective:** Dashboard with mock cards for fulfillment, finance, analytics

| Task | Time | Status |
|---|---|---|
| Dashboard layout + metric cards | 20m | ⬜ |
| Mock fulfillment tracking cards | 10m | ⬜ |
| Mock finance/revenue cards | 10m | ⬜ |
| Mock analytics charts | 10m | ⬜ |
| Agent activity feed | 10m | ⬜ |
| **Milestone: Dashboard looks production-ready** | | ⬜ |

**Exit Criteria:** Dashboard shows all 4 agents active + mock data looks real

---

### Phase 6: Deploy + Test + Demo Prep (Hour 7-8) 🔴 CRITICAL

**Objective:** Deploy, test, backup video, demo ready

| Task | Time | Status |
|---|---|---|
| Deploy to Cloudflare | 15m | ⬜ |
| E2E test all demo flows | 15m | ⬜ |
| Record backup video | 10m | ⬜ |
| ₹9 payment link tested | 5m | ⬜ |
| Pre-demo checklist verified | 5m | ⬜ |
| **Milestone: READY TO PRESENT** | | ⬜ |

---

## Escalation Rules

```
IF Phase 1 takes > 1 hour:
  → CHECK: Are all 4 gateways running?
  → CHECK: Is Shopify MCP connected? (curl /v1/tools on brain)
  → SKIP extra profiles, use brain for everything
  → Focus: Single profile + Shopify MCP + 1 demo flow

IF Phase 2 takes > 2 hours:
  → SKIP voice input, use text-only
  → SKIP image upload, use natural language only
  → Focus: 1 product creation + 1 pricing + 1 page

IF Phase 3 takes > 1.5 hours:
  → SKIP real social media posting
  → Show generated content in dashboard only
  → Focus: "Here's what it would post"
  → CUT marketing cron job

IF Phase 4 takes > 1 hour:
  → MOCK customer support responses
  → SKIP brand voice configuration
  → Focus: Pre-written support responses

IF behind by 2+ hours:
  → MOCK everything except store ops (Phase 2)
  → PLAY backup video for "wow" moments
  → LIVE demo only for chat + Shopify CRUD
  → PITCH the business case + architecture
  → Emphasize: "Zero backend code — 4 specialized AI agents"
```

**Priority order (cut from bottom):**
1. Store Ops (MUST HAVE — real Shopify CRUD)
2. Dashboard (MUST HAVE — visual impact)
3. Marketing (NICE TO HAVE — mock if needed)
4. Customer/Brand (NICE TO HAVE — mock if needed)

---

## The ₹9 Sale Demo Script

```
SETUP (before demo):
├── Create product "HermesStore Demo T-Shirt" in Shopify
├── Set price to ₹9 (or ₹99 for realism)
├── Generate Dodo/Razorpay payment link
├── Test payment link works
└── Have backup: mock transaction in dashboard

DEMO FLOW (2 minutes):
├── [30s] "Let me show you how easy it is to add a product"
│   └── Voice: "Add a premium cotton t-shirt at ₹999"
│   └── AI generates description, images, pricing suggestions
│
├── [30s] "Now let's create a landing page"
│   └── Text: "Create a landing page for our new t-shirt"
│   └── AI generates page with hero, features, CTA
│
├── [30s] "Let's run a flash sale"
│   └── Text: "Create a ₹9 flash sale for the t-shirt"
│   └── AI generates promo post, updates price, creates payment link
│
├── [30s] "Let's make a real purchase"
│   └── Show payment link on screen
│   └── Audience member scans + pays ₹9
│   └── Dashboard updates in real-time
│
└── [10s] "All of this with zero backend code"
    └── Show: 4 Hermes profiles, 0 lines of backend code
    └── Show: Architecture diagram
```

---

## Pre-Demo Checklist (30 min before)

```
INFRASTRUCTURE:
├── [  ] All 4 Hermes gateways running
│   ├── brain: curl http://localhost:8642/health → OK
│   ├── storeops: curl http://localhost:8643/health → OK
│   ├── marketing: curl http://localhost:8644/health → OK
│   └── customer-brand: curl http://localhost:8645/health → OK
├── [  ] Shopify MCP connected (curl /v1/tools shows Shopify tools)
├── [  ] Frontend deployed to Cloudflare + URL works
└── [  ] WiFi connected + tested (have mobile hotspot backup)

PRODUCTS:
├── [  ] 5+ demo products loaded in Shopify
├── [  ] ₹9 demo product created + payment link ready
├── [  ] Landing page deployed + URL works
└── [  ] Mock data populated in dashboard

PRESENTATION:
├── [  ] Laptop charged to 100%
├── [  ] Charger + extension cord ready
├── [  ] All terminal tabs open + ready
├── [  ] Browser tabs: Shopify admin, Cloudflare, frontend
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

## Timeline Visualization

```
JULY 11 (Tonight)
├── 6:00 PM  ─── Start pre-registration
├── 7:00 PM  ─── Clone repos + install deps
├── 8:00 PM  ─── Create Hermes profiles + test gateways
├── 9:00 PM  ─── Review planning docs
├── 10:00 PM ─── Record backup video
└── 11:00 PM ─── SLEEP (you need it)

JULY 12 (Event Day)
├── 8:00 AM  ─── Arrive, set up, collect numbers
├── 9:00 AM  ─── PHASE 1: Foundation (1 hour — 4 profiles + frontend)
├── 10:00 AM ─── PHASE 2: Store Ops (2 hours — product lister + pricing)
├── 12:00 PM ─── PHASE 3: Marketing (1.5 hours — social + promo)
├── 1:30 PM  ─── ☕ BREAK (30 min)
├── 2:00 PM  ─── PHASE 4: Customer/Brand (1 hour — support + copy)
├── 3:00 PM  ─── PHASE 5: Dashboard (1 hour — mock cards + polish)
├── 4:00 PM  ─── PHASE 6: Deploy + Test (1 hour — Cloudflare + backup)
├── 5:00 PM  ─── 🎤 DEMO TIME
└── 5:30 PM  ─── 🎉 Celebrate / Network
```

---

## Profile Responsibilities

| Profile | Port | Skills | Responsibility |
|---|---|---|---|
| **brain** | 8642 | Orchestrator, Shopify MCP | Routes requests, manages products, pricing |
| **storeops** | 8643 | Product Lister, Inventory, Landing Pages | Store operations, voice/image input |
| **marketing** | 8644 | Social Posts, Content Creator, Promo | Marketing campaigns, engagement cron |
| **customer-brand** | 8645 | Support Agent, Brand Voice, Copywriter | Customer service, brand consistency |

---

## Time Savings Summary

| What we thought we needed | Actual | Saved |
|---|---|---|
| Custom API routes | Hermes built-in `/v1/chat/completions` | ~2h |
| Custom SSE streaming | `stream: true` (OpenAI-compatible) | ~1.5h |
| Custom session management | Hermes built-in `/api/sessions` | ~1h |
| Custom backend server | 4x `hermes -p <name> gateway` | ~2h |
| **Total saved** | | **~6.5h** |

**Reinvested in:** 4 specialized profiles, better UI polish, real ₹9 sale demo, voice commands, and buffer time for debugging.
