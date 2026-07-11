# HermesStore Architecture

> AI-powered ecommerce store manager built on Hermes Agent  
> GrowthX Hermes Buildathon · Target: Shopify stores in India · ₹499–1999/month

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend (Thin Client)](#2-frontend-thin-client)
3. [Hermes API Server (Built-In Backend)](#3-hermes-api-server-built-in-backend)
4. [Hermes Layer](#4-hermes-layer)
5. [Database](#5-database)
6. [Integrations](#6-integrations)
7. [Data Flow](#7-data-flow)
8. [Deployment](#8-deployment)
9. [Security](#9-security)
10. [Development Workflow](#10-development-workflow)

---

## 1. System Overview

> **Key insight:** Hermes Agent has a **built-in OpenAI-compatible API server** (port 8642). This means the Next.js frontend is a **thin client** — just UI, no backend logic, no API routes, no subprocess spawning. The frontend connects directly to Hermes.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                                │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND — THIN CLIENT (Next.js 16)                    │  │
│  │                                                                           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │Dashboard │ │ Products │ │  Orders  │ │Marketing │ │ Competitors  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────────────┐│  │
│  │  │ Support  │ │  Agents  │ │ Settings │ │   Chat UI (agent-ui fork)    ││  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────────────────┘│  │
│  │                                                                           │  │
│  │  NO API routes. NO backend code. Just React components + fetch calls.     │  │
│  └──────────────────────────────────┬────────────────────────────────────────┘  │
│                                     │                                           │
│                          HTTP (SSE streaming)                                   │
│                      http://localhost:8642/v1/...                               │
│                                     │                                           │
│  ┌──────────────────────────────────┴────────────────────────────────────────┐  │
│  │              HERMES API SERVER (Built-In · Port 8642)                      │  │
│  │                                                                           │  │
│  │  OpenAI-compatible endpoints:                                             │  │
│  │  • POST /v1/chat/completions     Chat (SSE streaming)                     │  │
│  │  • GET  /v1/skills               Discover available skills                │  │
│  │  • GET  /v1/toolsets             Discover available toolsets              │  │
│  │  • POST /api/runs                Long-running agent tasks                │  │
│  │  • GET/POST /api/approvals       Approval flows                          │  │
│  │  • CRUD /api/jobs                Cron job management                     │  │
│  │  • CRUD /api/sessions            Session management                      │  │
│  └──────────────────────────────────┬────────────────────────────────────────┘  │
│                                     │                                           │
│                                     │ (internal)                                │
│                                     ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         HERMES AGENT (Core)                               │   │
│  │                                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │   Skills    │  │  Cron Jobs  │  │  Subagents  │  │  MCP Client     │  │  │
│  │  │             │  │  (monitor)  │  │  (on-demand)│  │                 │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────┬────────┘  │  │
│  └──────────────────────────────────────────────────────────────┼───────────┘  │
│                                                                 │               │
│                    ┌────────────────┬───────────────┬────────────┼───────┐      │
│                    │                │               │            │       │      │
│              ┌─────┴─────┐  ┌──────┴──────┐ ┌─────┴─────┐ ┌───┴────┐  │      │
│              │  Shopify  │  │  AgentMemory│ │   Linkup  │ │ Dodo   │  │      │
│              │  MCP      │  │  MCP        │ │           │ │Payments│  │      │
│              │ (75 tools)│  │             │ │(competitor│ │        │  │      │
│              └─────┬─────┘  └──────┬──────┘ │  data)   │ └────────┘  │      │
│                    │               │         └──────────┘             │      │
│              ┌─────┴─────┐  ┌──────┴──────┐                          │      │
│              │  Shopify  │  │   Convex    │                          │      │
│              │   Store   │  │  Database   │                          │      │
│              └───────────┘  └─────────────┘                          │      │
│                                                                       │      │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │                      EXTERNAL SERVICES                              │      │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────────────┐  │      │
│  │  │  OpenAI   │ │ElevenLabs │ │ Wispr Flow│ │   Cloudflare       │  │      │
│  │  │ GPT-5.5   │ │  (voice)  │ │(type-to-  │ │(Pages + Workers)   │  │      │
│  │  │           │ │           │ │ speak)    │ │                    │  │      │
│  │  └───────────┘ └───────────┘ └───────────┘ └────────────────────┘  │      │
│  └─────────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend (Thin Client)

The frontend is a **pure UI layer** with zero backend logic. All business logic, AI orchestration, and tool execution live inside Hermes.

### Tech Stack

| Technology     | Version | Purpose                              |
|----------------|---------|--------------------------------------|
| Next.js        | 16      | App Router, RSC for layout/static    |
| React          | 19      | Concurrent features, Server Actions  |
| Tailwind CSS   | 4       | Utility-first styling, CSS-first config |
| shadcn/ui      | latest  | Accessible component primitives      |
| TypeScript     | 5.x     | Type safety throughout               |

### What the Frontend Does NOT Need

- ❌ No API route handlers (`/api/*`)
- ❌ No Express.js server
- ❌ No subprocess spawning (`child_process`)
- ❌ No custom SSE/streaming implementation
- ❌ No server-side business logic
- ❌ No session management code
- ❌ No approval flow orchestration

### What the Frontend DOES

- ✅ Renders UI components (dashboard, tables, forms, chat)
- ✅ Calls Hermes API Server directly via `fetch()`
- ✅ Handles SSE streaming for chat responses
- ✅ Displays real-time data from Convex subscriptions
- ✅ Manages client-side UI state (filters, pagination, search)

### Chat UI

Fork **[agno-agi/agent-ui](https://github.com/agno-agi/agent-ui)** and adapt for HermesStore:

- Point at Hermes SSE endpoint: `http://localhost:8642/v1/chat/completions`
- Add Shopify-specific message renderers (product cards, order tables, analytics charts)
- Add voice input button (Wispr Flow integration)
- Add agent status indicators (subagent spawns, tool calls, MCP operations)

### Frontend API Client

```typescript
// lib/hermes-client.ts — Single source of truth for Hermes API calls

const HERMES_URL = process.env.NEXT_PUBLIC_HERMES_URL || 'http://localhost:8642';
const HERMES_KEY = process.env.NEXT_PUBLIC_HERMES_API_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${HERMES_KEY}`,
};

// Chat with SSE streaming
export async function chatStream(message: string, sessionId?: string) {
  const res = await fetch(`${HERMES_URL}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'hermes',
      messages: [{ role: 'user', content: message }],
      stream: true,
      ...(sessionId && { session_id: sessionId }),
    }),
  });
  return res.body; // ReadableStream for SSE
}

// Discover available skills
export async function getSkills() {
  const res = await fetch(`${HERMES_URL}/v1/skills`, { headers });
  return res.json();
}

// Discover available toolsets
export async function getToolsets() {
  const res = await fetch(`${HERMES_URL}/v1/toolsets`, { headers });
  return res.json();
}

// Long-running agent task (returns run ID for polling)
export async function createRun(skill: string, params: Record<string, string>) {
  const res = await fetch(`${HERMES_URL}/api/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ skill, params }),
  });
  return res.json();
}

// Manage cron jobs
export async function listJobs() {
  const res = await fetch(`${HERMES_URL}/api/jobs`, { headers });
  return res.json();
}

export async function createJob(job: { name: string; schedule: string; skill: string }) {
  const res = await fetch(`${HERMES_URL}/api/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(job),
  });
  return res.json();
}

// Manage sessions
export async function listSessions() {
  const res = await fetch(`${HERMES_URL}/api/sessions`, { headers });
  return res.json();
}

// Handle approval requests
export async function getApprovals() {
  const res = await fetch(`${HERMES_URL}/api/approvals`, { headers });
  return res.json();
}

export async function approveAction(id: string) {
  const res = await fetch(`${HERMES_URL}/api/approvals/${id}/approve`, {
    method: 'POST',
    headers,
  });
  return res.json();
}
```

### Pages

```
/                          → Dashboard (overview, KPIs, recent activity)
/products                  → Product catalog (CRUD, bulk edit, AI suggestions)
/products/[id]             → Product detail + edit
/orders                    → Order list, filters, status tracking
/orders/[id]               → Order detail + fulfillment
/marketing                 → Campaign manager, SEO, social media drafts
/marketing/campaigns/[id]  → Campaign detail
/competitors               → Competitor monitoring (Linkup data)
/support                   → AI customer support (auto-reply, FAQ management)
/agents                    → Agent dashboard (cron jobs, subagents, logs)
/agents/[id]               → Agent detail + run history
/settings                  → Store settings, API keys, billing, plan management
/chat                      → Full-screen chat interface (agent-ui fork)
```

### Component Architecture

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + topbar layout
│   ├── page.tsx            # Dashboard
│   ├── products/
│   │   ├── page.tsx        # Product list
│   │   └── [id]/page.tsx   # Product detail
│   ├── orders/
│   │   ├── page.tsx        # Order list
│   │   └── [id]/page.tsx   # Order detail
│   ├── marketing/
│   │   ├── page.tsx        # Marketing overview
│   │   └── campaigns/[id]/page.tsx
│   ├── competitors/
│   │   └── page.tsx        # Competitor dashboard
│   ├── support/
│   │   └── page.tsx        # Support dashboard
│   ├── agents/
│   │   ├── page.tsx        # Agent manager
│   │   └── [id]/page.tsx   # Agent detail
│   └── settings/
│       └── page.tsx        # Settings
├── chat/
│   └── page.tsx            # Full chat interface
├── lib/
│   ├── hermes-client.ts    # Hermes API client (see above)
│   └── convex.ts           # Convex client for real-time data
└── components/
    ├── chat/               # agent-ui fork components
    ├── dashboard/          # KPI cards, charts
    ├── products/           # Product table, forms
    ├── orders/             # Order table, timeline
    ├── agents/             # Agent cards, log viewer
    └── ui/                 # shadcn/ui primitives
```

> **Note:** No `api/` directory. No route handlers. All data comes from Hermes API Server or Convex.

### State Management

- **Server Components** (RSC): Layout, static content
- **React 19 `use()`**: Suspense-based async data loading in client components
- **Convex React hooks**: Real-time subscriptions for live data (products, orders, analytics)
- **URL state**: Filters, pagination, search via `nuqs` or Next.js `searchParams`
- **No global state library needed**: RSC + Convex + URL covers all cases

---

## 3. Hermes API Server (Built-In Backend)

Hermes Agent includes a **built-in OpenAI-compatible API server** that eliminates all custom backend code. This is the **only backend** needed.

### Setup

```bash
# 1. Create a dedicated Hermes profile for the store
hermes profile create hermesstore

# 2. Add to ~/.hermes/.env (or profile-specific .env)
API_SERVER_ENABLED=true
API_SERVER_KEY=<32-char-hex-key>
API_SERVER_PORT=8642

# 3. Start the gateway
hermes -p hermesstore gateway
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | Chat with Hermes (OpenAI-compatible, SSE streaming) |
| `/v1/skills` | GET | List available skills |
| `/v1/toolsets` | GET | List available toolsets |
| `/api/runs` | POST | Create long-running agent task |
| `/api/approvals` | GET/POST | View and respond to approval requests |
| `/api/jobs` | GET/POST/PUT/DELETE | CRUD for cron jobs |
| `/api/sessions` | GET/POST | Session management |

### Chat Completions (SSE Streaming)

```bash
curl -X POST http://localhost:8642/v1/chat/completions \
  -H "Authorization: Bearer $API_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "hermes",
    "messages": [{"role": "user", "content": "Show me my top 10 products by revenue"}],
    "stream": true
  }'
```

### Cron Job Management

```bash
# List all cron jobs
curl http://localhost:8642/api/jobs \
  -H "Authorization: Bearer $API_SERVER_KEY"

# Create a new cron job
curl -X POST http://localhost:8642/api/jobs \
  -H "Authorization: Bearer $API_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "order-monitor", "schedule": "*/5 * * * *", "skill": "order-processing"}'
```

### Why This Is Better Than Custom Backend

| Approach | Lines of Code | Moving Parts | Failure Points |
|----------|--------------|--------------|----------------|
| Custom Express/Next.js backend | 500-2000+ | Express, subprocess, SSE, session mgmt | Many |
| **Hermes API Server** | **0** | **Hermes only** | **1** |

---

## 4. Hermes Layer

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HERMES AGENT                                │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      MCP CLIENT                               │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │  shopify    │  │ agentmemory │  │  linkup (optional)  │  │  │
│  │  │  MCP        │  │  MCP        │  │                     │  │  │
│  │  │             │  │             │  │                     │  │  │
│  │  │ 75 tools:   │  │ • memory_   │  │ • search            │  │  │
│  │  │ • products  │  │   save      │  │ • analyze           │  │  │
│  │  │ • orders    │  │ • memory_   │  │ • compare           │  │  │
│  │  │ • customers │  │   recall    │  │                     │  │  │
│  │  │ • inventory │  │ • memory_   │  │                     │  │  │
│  │  │ • discounts │  │   sessions  │  │                     │  │  │
│  │  │ • analytics │  │ • memory_   │  │                     │  │  │
│  │  │ • ...       │  │   export    │  │                     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   API SERVER (Built-In)                        │  │
│  │                   Port 8642 · OpenAI-compatible                │  │
│  │                                                               │  │
│  │  • /v1/chat/completions  (SSE streaming)                      │  │
│  │  • /v1/skills            (skill discovery)                    │  │
│  │  • /v1/toolsets          (toolset discovery)                  │  │
│  │  • /api/runs             (long-running tasks)                 │  │
│  │  • /api/approvals        (approval flows)                     │  │
│  │  • /api/jobs             (cron CRUD)                          │  │
│  │  • /api/sessions         (session management)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │     CRON JOBS       │  │     SUBAGENTS        │                  │
│  │  (scheduled tasks)  │  │   (on-demand)        │                  │
│  │                     │  │                      │                  │
│  │  • order_monitor    │  │  • product_creator   │                  │
│  │    every 5min       │  │  • marketing_writer  │                  │
│  │  • inventory_check  │  │  • support_reply     │                  │
│  │    every 15min      │  │  • price_optimizer   │                  │
│  │  • competitor_scan  │  │  • report_generator  │                  │
│  │    daily 9am        │  │  • bulk_updater      │                  │
│  │  • daily_digest     │  │                      │                  │
│  │    daily 8am        │  │                      │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        SKILLS                                  │  │
│  │                                                               │  │
│  │  • product-management    Create, update, optimize products    │  │
│  │  • order-processing      Fulfill, refund, track orders        │  │
│  │  • marketing-automation  Draft copy, schedule posts, SEO      │  │
│  │  • competitor-analysis   Monitor, compare, alert              │  │
│  │  • customer-support      Auto-reply, escalate, FAQ            │  │
│  │  • store-analytics       Reports, trends, forecasts           │  │
│  │  • inventory-management  Restock alerts, supplier comms       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Hermes Configuration

```yaml
# ~/.hermes/profiles/hermesstore/config.yaml
model: openai/gpt-5.5
providers:
  openai:
    api_key: ${OPENAI_API_KEY}
mcp:
  servers:
    shopify:
      command: npx
      args: ["-y", "@shopify/shopify-mcp-server"]
      env:
        SHOPIFY_ACCESS_TOKEN: ${SHOPIFY_ACCESS_TOKEN}
        SHOPIFY_STORE_URL: ${SHOPIFY_STORE_URL}
    agentmemory:
      command: npx
      args: ["-y", "agentmemory-mcp-server"]
      env:
        AGENTMEMORY_API_KEY: ${AGENTMEMORY_API_KEY}
    linkup:
      command: npx
      args: ["-y", "linkup-mcp-server"]
      env:
        LINKUP_API_KEY: ${LINKUP_API_KEY}
```

### Cron Jobs

| Job               | Schedule          | Skill                  | Description                                    |
|-------------------|-------------------|------------------------|------------------------------------------------|
| `order-monitor`   | Every 5 min       | `order-processing`     | Check new orders, update status, alert on issues |
| `inventory-check` | Every 15 min      | `inventory-management` | Low stock alerts, auto-reorder suggestions       |
| `competitor-scan` | Daily 9:00 AM IST | `competitor-analysis`  | Price changes, new products, market trends       |
| `daily-digest`    | Daily 8:00 AM IST | `store-analytics`      | Yesterday's summary: orders, revenue, alerts     |
| `seo-audit`       | Weekly Monday     | `marketing-automation` | Check product SEO scores, suggest improvements   |

### Subagents (On-Demand)

Spawned when user requests via chat or dashboard action:

```
User: "Create a Diwali sale campaign"
  → spawn subagent: marketing-automation skill
  → generates: discount codes, banner copy, email draft, social posts
  → returns: structured campaign plan
```

```
User: "Why are orders dropping this week?"
  → spawn subagent: store-analytics + competitor-analysis skills
  → analyzes: order data, competitor pricing, market trends
  → returns: diagnosis + recommendations
```

---

## 5. Database

### Convex (Primary)

Real-time synced database. Queries push updates to connected clients automatically.

```
┌─────────────────────────────────────────────────────────────┐
│                    CONVEX SCHEMA                             │
│                                                             │
│  products                                                   │
│  ├── _id              v.id("products")                      │
│  ├── shopifyId        v.string()                            │
│  ├── title            v.string()                            │
│  ├── description      v.string()                            │
│  ├── price            v.number()                            │
│  ├── compareAtPrice   v.optional(v.number())                │
│  ├── inventory        v.number()                            │
│  ├── status           v.union("active","draft","archived")  │
│  ├── tags             v.array(v.string())                   │
│  ├── images           v.array(v.string())                   │
│  ├── seoScore         v.optional(v.number())                │
│  ├── lastSynced       v.number()                            │
│  └── _creationTime    v.number()                            │
│                                                             │
│  orders                                                     │
│  ├── _id              v.id("orders")                        │
│  ├── shopifyId        v.string()                            │
│  ├── orderNumber      v.string()                            │
│  ├── customer         v.object({ name, email, phone })      │
│  ├── items            v.array(v.object({ productId, qty, price }))│
│  ├── total            v.number()                            │
│  ├── currency         v.string()                            │
│  ├── status           v.union("pending","confirmed","shipped",│
│  │                           "delivered","cancelled")        │
│  ├── shippingAddress  v.object({...})                       │
│  ├── createdAt        v.number()                            │
│  └── updatedAt        v.number()                            │
│                                                             │
│  agentLogs                                                  │
│  ├── _id              v.id("agentLogs")                     │
│  ├── type             v.union("chat","cron","subagent")     │
│  ├── skill            v.optional(v.string())                │
│  ├── input            v.string()                            │
│  ├── output           v.string()                            │
│  ├── status           v.union("running","success","error")  │
│  ├── tokensUsed       v.optional(v.number())                │
│  ├── duration         v.optional(v.number())                │
│  └── createdAt        v.number()                            │
│                                                             │
│  contacts                                                   │
│  ├── _id              v.id("contacts")                      │
│  ├── shopifyId        v.string()                            │
│  ├── name             v.string()                            │
│  ├── email            v.string()                            │
│  ├── phone            v.optional(v.string())                │
│  ├── totalOrders      v.number()                            │
│  ├── totalSpent       v.number()                            │
│  ├── segment          v.array(v.string())                   │
│  └── lastActive       v.number()                            │
│                                                             │
│  analytics                                                  │
│  ├── _id              v.id("analytics")                     │
│  ├── date             v.string()                            │
│  ├── metric           v.string()                            │
│  ├── value            v.number()                            │
│  ├── metadata         v.optional(v.object({}))              │
│  └── createdAt        v.number()                            │
│                                                             │
│  settings                                                   │
│  ├── _id              v.id("settings")                      │
│  ├── userId           v.string()                            │
│  ├── shopifyDomain    v.string()                            │
│  ├── plan             v.union("starter","growth","scale")   │
│  ├── preferences      v.object({})                          │
│  ├── apiKeys          v.object({})                          │
│  └── updatedAt        v.number()                            │
└─────────────────────────────────────────────────────────────┘
```

### Convex Functions

```typescript
// convex/products.ts
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  }
});

export const sync = mutation({
  args: { products: v.array(v.any()) },
  handler: async (ctx, { products }) => {
    for (const product of products) {
      const existing = await ctx.db.query("products")
        .withIndex("by_shopifyId", q => q.eq("shopifyId", product.id))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { ...product, lastSynced: Date.now() });
      } else {
        await ctx.db.insert("products", { ...product, lastSynced: Date.now() });
      }
    }
  }
});
```

### SQLite Fallback (Local Dev)

For local development without Convex:

```typescript
// lib/db-local.ts — uses better-sqlite3
import Database from 'better-sqlite3';

const db = new Database('./hermesstore.db');

// Same schema as Convex, but local SQLite
// Used when CONVEX_URL is not set
export const isLocal = !process.env.CONVEX_URL;
```

---

## 6. Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION MAP                              │
│                                                                 │
│                         HermesStore                              │
│                            │                                    │
│           ┌────────────────┼────────────────┐                   │
│           │                │                │                   │
│           ▼                ▼                ▼                   │
│  ┌────────────────┐ ┌────────────┐ ┌────────────────┐          │
│  │   COMMERCE     │ │   AI       │ │   VOICE        │          │
│  │                │ │            │ │                │          │
│  │  Shopify MCP   │ │  OpenAI    │ │  ElevenLabs    │          │
│  │  (75 tools)    │ │  GPT-5.5   │ │  (TTS/STT)    │          │
│  │                │ │            │ │                │          │
│  │  • products    │ │  • chat    │ │  Wispr Flow   │          │
│  │  • orders      │ │  • analyze │ │  (voice type) │          │
│  │  • customers   │ │  • generate│ │                │          │
│  │  • inventory   │ │  • reason  │ │                │          │
│  │  • discounts   │ │            │ │                │          │
│  │  • analytics   │ │            │ │                │          │
│  │  • webhooks    │ │            │ │                │          │
│  └────────────────┘ └────────────┘ └────────────────┘          │
│                                                                 │
│           ┌────────────────┼────────────────┐                   │
│           │                │                │                   │
│           ▼                ▼                ▼                   │
│  ┌────────────────┐ ┌────────────┐ ┌────────────────┐          │
│  │   RESEARCH     │ │  PAYMENTS  │ │   HOSTING      │          │
│  │                │ │            │ │                │          │
│  │  Linkup        │ │  Dodo      │ │  Cloudflare    │          │
│  │  (competitor   │ │  Payments  │ │  Pages +       │          │
│  │   data)        │ │  (UPI/     │ │  Workers       │          │
│  │                │ │   cards)   │ │                │          │
│  │  • pricing     │ │            │ │  Vercel        │          │
│  │  • trends      │ │  • ₹499    │ │  (alternative) │          │
│  │  • new prods   │ │  • ₹999   │ │                │          │
│  │  • market data │ │  • ₹1999   │ │                │          │
│  └────────────────┘ └────────────┘ └────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Shopify MCP (75 Tools)

The primary integration. All store operations go through this MCP server:

| Category     | Tools (examples)                                          |
|-------------|-----------------------------------------------------------|
| Products     | create_product, update_product, list_products, delete_product, bulk_update |
| Orders       | list_orders, get_order, update_order, fulfill_order, cancel_order |
| Customers    | list_customers, get_customer, update_customer, search_customers |
| Inventory    | get_inventory_levels, adjust_inventory, set_inventory     |
| Discounts    | create_discount, update_discount, delete_discount         |
| Analytics    | get_sales_data, get_traffic_data, get_conversion_rate     |
| Webhooks     | create_webhook, list_webhooks, delete_webhook             |
| Metafields   | get_metafields, set_metafields                            |

### Dodo Payments

Pricing tiers for Indian market:

| Plan       | Price       | Features                                    |
|------------|-------------|---------------------------------------------|
| Starter    | ₹499/month  | Basic chat, 1 store, 100 API calls/day      |
| Growth     | ₹999/month  | + Cron jobs, 3 stores, 1000 calls/day       |
| Scale      | ₹1999/month | + Subagents, unlimited stores, unlimited    |

---

## 7. Data Flow

### Chat Flow (Primary)

```
┌──────────┐   POST /v1/chat/completions   ┌──────────────────────┐
│          │ ─────────────────────────────►│                      │
│  User    │  { messages, stream: true }   │  Hermes API Server   │
│  Browser │                               │  (built-in, :8642)   │
│          │◄─────────────────────────────│                      │
│          │  SSE stream                   │  No middleware.      │
└──────────┘                               │  No subprocess.      │
     ▲                                     │  Direct execution.   │
     │                                     └──────────┬───────────┘
     │                                                │
     │                                     (internal) │
     │                                                ▼
     │                                     ┌──────────────────┐
     │                                     │   Hermes Agent   │
     │                                     │                  │
     │                                     │  1. Parse msg    │
     │                                     │  2. Select skill │
     │                                     │  3. Call MCP     │
     │                                     │  4. Generate     │
     │                                     │     response     │
     │                                     │  5. Stream back  │
     │                                     └────────┬─────────┘
     │                                              │
     │                              ┌───────────────┼───────────────┐
     │                              │               │               │
     │                              ▼               ▼               ▼
     │                       ┌───────────┐  ┌────────────┐  ┌───────────┐
     │                       │  Shopify  │  │  AgentMemory│  │  Linkup   │
     │                       │  MCP      │  │  MCP        │  │  (if      │
     │                       │           │  │             │  │  needed)  │
     │                       └───────────┘  └────────────┘  └───────────┘
     │                              │
     │                              ▼
     │                       ┌───────────┐
     │                       │  Shopify  │
     │                       │  Store    │
     │                       │  (API)    │
     │                       └───────────┘
     │
     │  Convex real-time sync
     │◄─────────────────────────────────────────────────────────────
     │  (auto-pushed to all connected clients)
     ▼
┌──────────┐
│  Updated │
│  UI      │
└──────────┘
```

### Data Sync Flow

```
┌──────────────┐   webhooks    ┌──────────────────────┐
│   Shopify    │──────────────►│  Hermes API Server   │
│   Store      │               │  (handles webhooks)  │
└──────────────┘               └──────────┬───────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  Convex      │
                                   │  Mutation    │
                                   │              │
                                   │  Update:     │
                                   │  products    │
                                   │  orders      │
                                   │  customers   │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  Real-time   │
                                   │  push to     │
                                   │  connected   │
                                   │  browsers    │
                                   └──────────────┘

┌──────────────┐   cron trigger ┌──────────────┐
│  Hermes      │◄──────────────│  Hermes      │
│  Cron Jobs   │               │  Scheduler   │
│              │               │  (built-in)  │
│  order_      │               │              │
│  monitor     │               │              │
└──────┬───────┘               └──────────────┘
       │
       ▼
┌──────────────┐               ┌──────────────┐
│  Shopify MCP │──────────────►│  Convex      │
│  (fetch new  │               │  Mutation    │
│   orders)    │               │  (sync data) │
└──────────────┘               └──────────────┘
```

---

## 8. Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ARCHITECTURE                     │
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Frontend (Vercel   │  │  Hermes API Server (VPS/Railway) │  │
│  │  or Cloudflare)     │  │                                  │  │
│  │                     │  │  • hermes -p hermesstore gateway │  │
│  │  Next.js thin       │  │  • Port 8642                     │  │
│  │  client (static +   │  │  • OpenAI-compatible API         │  │
│  │  SSR)               │  │  • All business logic            │  │
│  │                     │  │  • MCP servers (Shopify, etc.)   │  │
│  │  hermesstore.       │  │  • Cron jobs + subagents         │  │
│  │  vercel.app         │  │                                  │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Custom Domain      │  │  Convex                          │  │
│  │                     │  │                                  │  │
│  │  hermesstore.in     │  │  Cloud-hosted database           │  │
│  │  (or .com)          │  │  (no self-hosting needed)        │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Stack

| Layer       | Service          | Reason                              |
|-------------|------------------|-------------------------------------|
| Frontend    | Vercel           | Best Next.js support, generous free tier |
| Backend     | Hermes API Server (VPS) | Built-in, zero custom code needed |
| Database    | Convex           | Real-time sync, managed hosting     |
| AI Model    | OpenAI GPT-5.5   | Latest reasoning capability         |
| Commerce    | Shopify MCP      | 75 tools, official support          |
| Voice       | ElevenLabs       | Best TTS quality for Indian accents |
| Hosting DNS | Cloudflare       | Fast DNS, free CDN                  |
| Payments    | Dodo Payments    | UPI + cards for India               |

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'

  # Hermes gateway runs on the VPS — deploy via SSH or Docker
  deploy-hermes:
    runs-on: ubuntu-latest
    steps:
      - name: Restart Hermes gateway
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd hermesstore
            git pull
            hermes -p hermesstore gateway restart
```

---

## 9. Security

### Authentication

- **NextAuth.js** (v5) with Shopify OAuth
- Session tokens stored in HTTP-only cookies
- Shopify store verification via OAuth flow

### API Security

```
┌──────────┐   HTTPS    ┌──────────────────┐   Internal   ┌──────────┐
│  Browser │───────────►│  Hermes API      │─────────────►│  Hermes  │
│          │            │  Server (:8642)  │              │  Agent   │
│          │◄───────────│                  │◄─────────────│          │
└──────────┘            │  • Bearer auth   │              └──────────┘
                        │  • API key check │
                        │  • Rate limit    │
                        │  • Input validate│
                        └──────────────────┘
```

### Key Security Practices

1. **Never expose Shopify tokens to frontend** — all Shopify calls go through Hermes → MCP
2. **API key authentication** — `API_SERVER_KEY` required on all requests
3. **Rate limiting** — configure at reverse proxy level (nginx/Cloudflare)
4. **Input validation** — Hermes handles validation internally
5. **Hermes sandboxing** — MCP servers run with minimal permissions
6. **Convex auth** — Server-side mutations verify user identity
7. **Webhook verification** — Validate Shopify webhook HMAC signatures

---

## 10. Development Workflow

### Local Setup

```bash
# 1. Clone and install frontend
git clone https://github.com/your-org/hermesstore.git
cd hermesstore
npm install

# 2. Create Hermes profile for the store
hermes profile create hermesstore

# 3. Configure Hermes
# Edit ~/.hermes/profiles/hermesstore/config.yaml with MCP servers
# Edit ~/.hermes/.env with API_SERVER_ENABLED=true, API_SERVER_KEY, etc.

# 4. Start Hermes gateway
hermes -p hermesstore gateway

# 5. Environment for frontend
cp .env.example .env.local
# Set: NEXT_PUBLIC_HERMES_URL=http://localhost:8642
#      NEXT_PUBLIC_HERMES_API_KEY=<your-api-key>
#      CONVEX_URL (or skip for SQLite fallback)

# 6. Start Convex (if using)
npx convex dev

# 7. Start Next.js
npm run dev
```

### Project Structure

```
hermesstore/
├── app/                    # Next.js App Router (thin client)
│   ├── (dashboard)/        # Dashboard layout group
│   ├── chat/               # Chat page
│   └── layout.tsx          # Root layout
├── components/
│   ├── chat/               # agent-ui fork components
│   ├── dashboard/          # Dashboard widgets
│   ├── products/           # Product components
│   ├── orders/             # Order components
│   ├── agents/             # Agent management
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── hermes-client.ts    # Hermes API client (fetch-based)
│   └── convex.ts           # Convex client setup
├── convex/                 # Convex schema + functions
│   ├── schema.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── agentLogs.ts
│   └── settings.ts
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md         # This file
```

> **Note:** No `api/` directory. No `lib/hermes.ts` subprocess wrapper. The frontend communicates with Hermes exclusively via HTTP to the API Server.

### Hermes Skills (Deployed Separately)

Skills live in the Hermes profile directory and are invoked by the Hermes Agent:

```
~/.hermes/profiles/hermesstore/skills/
├── hermesstore-product-management/
│   └── SKILL.md
├── hermesstore-order-processing/
│   └── SKILL.md
├── hermesstore-marketing-automation/
│   └── SKILL.md
├── hermesstore-competitor-analysis/
│   └── SKILL.md
├── hermesstore-customer-support/
│   └── SKILL.md
└── hermesstore-store-analytics/
    └── SKILL.md
```

---

## Appendix: Key Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Frontend framework | Next.js 16 | RSC, App Router, edge-ready, huge ecosystem |
| Chat UI | agno-agi/agent-ui fork | Purpose-built for agent chat, customizable |
| **Backend approach** | **Hermes API Server (built-in)** | **Zero custom code, OpenAI-compatible, SSE streaming, cron, approvals** |
| Database | Convex | Real-time sync out of the box, no WebSocket boilerplate |
| AI model | OpenAI GPT-5.5 | Best reasoning for complex store operations |
| Commerce API | Shopify MCP | 75 official tools, maintained by Shopify |
| Payments | Dodo Payments | UPI support for Indian market |
| Hosting | Vercel (frontend) + VPS (Hermes) | Thin client on edge, API server on reliable host |
| Voice | ElevenLabs + Wispr Flow | Quality TTS + seamless voice-to-text input |
| Pricing | ₹499/999/1999 | Indian market sweet spot, 3-tier SaaS model |
| **Hermes profile** | **`hermesstore` (dedicated)** | **Isolated from default profile, own skills/config/cron** |

---

*Last updated: 2026-07-11*
*Project: HermesStore — AI Ecommerce Store Manager*
*Buildathon: GrowthX Hermes Buildathon*
