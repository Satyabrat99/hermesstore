# AGENTS-V1.md — HermesStore Agent Definitions (Version 1)

> **Version:** 1.0 (GrowthX Buildathon Edition)
> **Created:** July 11, 2026
> **Total Agents:** 20 (reduced from 32 for 8-hour hackathon)
> **Platform:** Hermes Agent + Shopify MCP (MVP)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Hermes API Server Integration](#2-hermes-api-server-integration)
3. [Always-On Agents (Cron Jobs) — 8 Agents](#3-always-on-agents-cron-jobs--8-agents)
4. [On-Demand Agents (Subagents) — 12 Agents](#4-on-demand-agents-subagents--12-agents)
5. [Dependency Graph](#5-dependency-graph)
6. [Priority Matrix](#6-priority-matrix)
7. [Demo Flow](#7-demo-flow)
8. [MCP Tools Registry](#8-mcp-tools-registry)
9. [Implementation Order](#9-implementation-order)

---

## 1. Overview & Architecture

### Agent Hierarchy

```
ORCHESTRATOR (Main Chat)
│
├── ALWAYS-ON CRON JOBS (8)
│   ├── Store Health Monitor         (every 30m)
│   ├── Competitor Price Monitor     (every 2h)
│   ├── Inventory Tracker            (every 6h)
│   ├── Support Watcher              (every 15m)
│   ├── Analytics Digest             (daily 9am)
│   ├── Social Media Scheduler       (daily 9am)
│   ├── Engagement Responder         (every 30m)
│   └── Revenue Tracker              (daily)
│
└── ON-DEMAND SUBAGENTS (12)
    ├── Product Lister
    ├── Pricing Strategist
    ├── Landing Page Builder
    ├── SEO Optimizer
    ├── Content Creator
    ├── Marketing Copywriter
    ├── Ad Campaign Manager
    ├── Email Campaign Builder
    ├── Shipping Coordinator
    ├── Order Processor
    ├── Bulk Importer
    └── Store Setup Agent
```

### Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 P0 | Must-have for demo |
| 🟡 P1 | Nice-to-have for demo |
| 🟢 P2 | Post-hackathon |
| ✅ | Demo-ready |
| ⚠️ | Partial demo |
| ❌ | Not demo-ready |

---

## 2. Hermes API Server Integration

All agents — both cron-based (always-on) and on-demand (subagents) — communicate through the **Hermes API Server**. This replaces the previous approach of invoking agents via CLI subprocess. The API server provides a unified HTTP interface for creating, scheduling, triggering, approving, and monitoring agent runs.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     HERMES API SERVER                            │
│                    http://localhost:3000                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api/jobs          Cron job management (CRUD, pause, resume)    │
│  /v1/runs           On-demand agent runs (create, status, poll)  │
│  /v1/runs/{id}/approval  Human-in-the-loop approval flow        │
│  /v1/skills         Skill discovery and listing                  │
│  /v1/toolsets       Toolset discovery and listing                │
│                                                                  │
└────────────┬─────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌────────┐      ┌──────────┐
│  Cron  │      │ On-Demand│
│  Jobs  │      │ Subagents│
└────────┘      └──────────┘
```

### How Cron Jobs Connect (Always-On Agents)

Cron agents are registered as **recurring jobs** via the `/api/jobs` endpoint. The API server handles scheduling, execution, retries, and status tracking.

**Create a cron job:**
```bash
POST /api/jobs
{
  "name": "store-health-monitor",
  "skill": "store-health-check",
  "schedule": { "every": "30m" },
  "toolsets": ["shopify_mcp", "agentmemory"],
  "payload": {
    "prompt": "Check store health across all dimensions and produce a 0-100 score.",
    "model": "mimo-v2.5-pro"
  }
}
```

**Update a cron job:**
```bash
PATCH /api/jobs/{job_id}
{
  "schedule": { "every": "15m" },
  "payload": { "prompt": "Updated prompt with new health criteria" }
}
```

**Pause / Resume a cron job:**
```bash
POST /api/jobs/{job_id}/pause
POST /api/jobs/{job_id}/resume
```

**Trigger a cron job manually (outside schedule):**
```bash
POST /api/jobs/{job_id}/trigger
```

**List all cron jobs:**
```bash
GET /api/jobs
```

**Delete a cron job:**
```bash
DELETE /api/jobs/{job_id}
```

### How On-Demand Agents Connect (Subagents)

On-demand agents are triggered as **one-shot runs** via the `/v1/runs` endpoint. Each run gets a unique ID for status tracking, event streaming, and approval flows.

**Trigger an on-demand agent:**
```bash
POST /v1/runs
{
  "skill": "product-listing",
  "toolsets": ["shopify_mcp", "image_generate"],
  "input": {
    "prompt": "Add a new product: wireless charger, ₹1299, 50 units",
    "images": ["https://example.com/product.jpg"]
  },
  "model": "mimo-v2.5-pro"
}
# Response: { "run_id": "run_abc123", "status": "pending" }
```

**Check run status:**
```bash
GET /v1/runs/{run_id}
# Response: { "run_id": "run_abc123", "status": "running", "progress": 0.6 }
```

**Stream run events (SSE):**
```bash
GET /v1/runs/{run_id}/events
# Server-Sent Events stream with real-time agent output
```

**Cancel a running agent:**
```bash
POST /v1/runs/{run_id}/cancel
```

### How Approvals Work (Human-in-the-Loop)

Agents that require user confirmation (e.g., publishing a product, changing prices) pause at an approval gate. The API exposes the approval endpoint so the Orchestrator or UI can present the action to the user and collect their decision.

**Agent requests approval (internal):**
```bash
# The agent run pauses and emits an approval_requested event
# The run status becomes "awaiting_approval"
GET /v1/runs/{run_id}
# → { "status": "awaiting_approval", "approval": { "id": "apv_xyz", "action": "publish_product", "preview": {...} } }
```

**User approves or rejects:**
```bash
POST /v1/runs/{run_id}/approval
{
  "decision": "approve",        // or "reject" or "modify"
  "modifications": null          // optional: user edits before approval
}
```

**Example approval flow for Product Lister:**
```
User: "Add wireless charger"
  → Product Lister run starts
  → Generates title, description, price, images
  → Run pauses: status = "awaiting_approval"
  → UI shows preview card to user
  → User clicks "Approve"
  → POST /v1/runs/{run_id}/approval { "decision": "approve" }
  → Run resumes: creates product on Shopify as "active"
  → Run completes: status = "completed"
```

### How Skills Are Loaded and Discovered

Skills are the procedural knowledge that guides each agent. They are discovered and loaded via the `/v1/skills` endpoint.

**List available skills:**
```bash
GET /v1/skills
# → [{ "name": "product-listing", "description": "Create Shopify products...", "tools": ["shopify_mcp"] }, ...]
```

**Get skill details:**
```bash
GET /v1/skills/{skill_name}
# → { "name": "product-listing", "content": "...", "toolsets": ["shopify_mcp"], "triggers": [...] }
```

**Skill resolution at run time:**
When a cron job or on-demand run is created with `"skill": "product-listing"`, the API server loads the SKILL.md content and injects it into the agent's system prompt. This ensures consistent behavior without hardcoding instructions in each request.

### How Toolsets Are Discovered

Toolsets define which MCP tools and built-in tools an agent can access. Discovery happens via `/v1/toolsets`.

**List available toolsets:**
```bash
GET /v1/toolsets
# → [{ "name": "shopify_mcp", "tools": ["create_product", "list_orders", ...] }, ...]
```

**Get toolset details:**
```bash
GET /v1/toolsets/{toolset_name}
# → { "name": "shopify_mcp", "tool_count": 75, "tools": [...] }
```

### Agent-Specific API Connection Patterns

| Agent | Type | API Endpoint | Skill | Toolsets |
|-------|------|-------------|-------|----------|
| Store Health Monitor | Cron | `POST /api/jobs` (every 30m) | `store-health-check` | `shopify_mcp`, `agentmemory`, `web_search` |
| Competitor Price Monitor | Cron | `POST /api/jobs` (every 2h) | `competitor-spy` | `browser_*`, `web_extract`, `shopify_mcp`, `agentmemory` |
| Inventory Tracker | Cron | `POST /api/jobs` (every 6h) | `inventory-management` | `shopify_mcp`, `agentmemory` |
| Support Watcher | Cron | `POST /api/jobs` (every 15m) | `customer-support` | `shopify_mcp`, `agentmemory` |
| Analytics Digest | Cron | `POST /api/jobs` (daily 9am) | `sales-dashboard` | `shopify_mcp`, `agentmemory`, `text_to_speech` |
| Social Media Scheduler | Cron | `POST /api/jobs` (daily 9am) | `social-planner` | `shopify_mcp`, `web_search`, `image_generate` |
| Engagement Responder | Cron | `POST /api/jobs` (every 30m) | `engagement-responder` | `shopify_mcp`, `agentmemory` |
| Revenue Tracker | Cron | `POST /api/jobs` (daily midnight) | `revenue-reconciler` | `shopify_mcp`, `agentmemory` |
| Product Lister | On-Demand | `POST /v1/runs` | `product-listing` | `shopify_mcp`, `image_generate`, `web_extract` |
| Pricing Strategist | On-Demand | `POST /v1/runs` | `pricing-optimizer` | `shopify_mcp`, `agentmemory`, `web_search` |
| Landing Page Builder | On-Demand | `POST /v1/runs` | `page-builder` | `shopify_mcp`, `write_file`, `image_generate` |
| SEO Optimizer | On-Demand | `POST /v1/runs` | `seo-optimization` | `web_search`, `shopify_mcp`, `agentmemory` |
| Content Creator | On-Demand | `POST /v1/runs` | `content-engine` | `image_generate`, `terminal`, `write_file` |
| Marketing Copywriter | On-Demand | `POST /v1/runs` | `marketing-copy` | `shopify_mcp`, `agentmemory` |
| Ad Campaign Manager | On-Demand | `POST /v1/runs` | `campaign-builder` | `shopify_mcp`, `image_generate` |
| Email Campaign Builder | On-Demand | `POST /v1/runs` | `email-builder` | `shopify_mcp`, `write_file` |
| Shipping Coordinator | On-Demand | `POST /v1/runs` | `carrier-selector` | `shopify_mcp`, `terminal` |
| Order Processor | On-Demand | `POST /v1/runs` | `order-autopilot` | `shopify_mcp` |
| Bulk Importer | On-Demand | `POST /v1/runs` | `product-listing` | `terminal`, `shopify_mcp` |
| Store Setup Agent | On-Demand | `POST /v1/runs` | `store-wizard` | `shopify_mcp`, `write_file`, `image_generate` |

### Example: Full Lifecycle of an On-Demand Agent

```bash
# 1. Discover available skills
curl http://localhost:3000/v1/skills

# 2. Trigger the Product Lister
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "product-listing",
    "toolsets": ["shopify_mcp", "image_generate"],
    "input": { "prompt": "Add wireless charger, ₹1299, 50 units" }
  }'
# → { "run_id": "run_abc123", "status": "pending" }

# 3. Poll for status
curl http://localhost:3000/v1/runs/run_abc123
# → { "status": "awaiting_approval", "approval": { "action": "publish_product", ... } }

# 4. Approve the product
curl -X POST http://localhost:3000/v1/runs/run_abc123/approval \
  -H "Content-Type: application/json" \
  -d '{ "decision": "approve" }'
# → { "status": "running" }

# 5. Check final result
curl http://localhost:3000/v1/runs/run_abc123
# → { "status": "completed", "output": { "product_id": "gid://shopify/Product/123", ... } }
```

### Example: Full Lifecycle of a Cron Job

```bash
# 1. Create the Competitor Price Monitor cron job
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "competitor-price-monitor",
    "skill": "competitor-spy",
    "schedule": { "every": "2h" },
    "toolsets": ["browser_*", "web_extract", "shopify_mcp", "agentmemory"],
    "payload": { "prompt": "Scrape competitor URLs, detect price changes >5%, alert user." }
  }'
# → { "job_id": "job_xyz789", "status": "active", "next_run": "2026-07-11T16:00:00Z" }

# 2. Manually trigger it (outside schedule)
curl -X POST http://localhost:3000/api/jobs/job_xyz789/trigger
# → { "run_id": "run_def456", "status": "pending" }

# 3. Monitor the triggered run
curl http://localhost:3000/v1/runs/run_def456
# → { "status": "completed", "output": { "price_changes_detected": [...] } }

# 4. Update the schedule
curl -X PATCH http://localhost:3000/api/jobs/job_xyz789 \
  -H "Content-Type: application/json" \
  -d '{ "schedule": { "every": "1h" } }'

# 5. Pause during maintenance
curl -X POST http://localhost:3000/api/jobs/job_xyz789/pause

# 6. Resume after maintenance
curl -X POST http://localhost:3000/api/jobs/job_xyz789/resume
```

### Key Differences from CLI Subprocess Approach

| Aspect | Old (CLI Subprocess) | New (API Server) |
|--------|---------------------|-----------------|
| Invocation | `hermes run --skill X` via shell | `POST /v1/runs` via HTTP |
| Scheduling | OS cron or manual | `/api/jobs` with built-in scheduler |
| Status tracking | Parse stdout | `GET /v1/runs/{id}` with structured JSON |
| Approvals | Not supported natively | `/v1/runs/{id}/approval` endpoint |
| Skill discovery | Read local files | `GET /v1/skills` endpoint |
| Toolset discovery | Config file inspection | `GET /v1/toolsets` endpoint |
| Error handling | Exit codes | Structured error responses |
| Concurrency | Process management | Server-managed worker pool |
| Observability | Log files | `/v1/runs/{id}/events` SSE stream |

---

## 3. Always-On Agents (Cron Jobs) — 8 Agents

---

### Agent 1: Store Health Monitor

| Field | Value |
|-------|-------|
| **Name** | Store Health Monitor |
| **Type** | Cron Job |
| **Schedule** | Every 30 minutes |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Master health dashboard — aggregates all store signals into a single 0-100 score.

**Input:**
- Current product catalog (Shopify MCP)
- Recent order data (last 24h)
- Inventory levels
- Website uptime/performance
- Marketing campaign status
- Financial data (revenue, margins)

**Output:**
```json
{
  "overall_score": 78,
  "breakdown": {
    "product_health": 85,
    "order_health": 92,
    "inventory_health": 65,
    "website_health": 88,
    "marketing_health": 70,
    "financial_health": 68
  },
  "alerts": [
    {"severity": "high", "message": "3 products below 20% stock", "agent": "inventory-tracker"},
    {"severity": "medium", "message": "Conversion rate dropped 12% this week", "agent": "cro-monitor"}
  ],
  "trend": "stable",
  "last_7d_delta": "+3"
}
```

**Tools Used:**
- `shopify_mcp` — products, orders, inventory, analytics
- `web_search` — market benchmarks
- `agentmemory` — historical scores for trend analysis
- `write_file` — persist daily health reports

**Skills Required:**
- `store-health-check` (from dainostore)
- `sales-dashboard` (from dainostore)
- `orchestrator-rules`

**Dependencies:**
- Calls: All other cron agents for their metrics
- Called by: Orchestrator (for health overview)
- Triggers: Alerts to user via Telegram/WhatsApp

**Notes:**
- Score < 60 = urgent alert to user
- Score < 40 = auto-escalate with specific action items
- Stores last 30 days of scores for trend visualization

---

### Agent 2: Competitor Price Monitor

| Field | Value |
|-------|-------|
| **Name** | Competitor Price Monitor |
| **Type** | Cron Job |
| **Schedule** | Every 2 hours |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Scrapes competitor URLs, detects price changes >5%, alerts user with competitive intelligence.

**Input:**
- Competitor product URLs (from memory/config)
- Own product prices (Shopify MCP)
- Historical price data (AgentMemory)

**Output:**
```json
{
  "scan_time": "2026-07-11T14:00:00Z",
  "competitors_checked": 5,
  "price_changes_detected": [
    {
      "competitor": "Competitor A",
      "product": "Wireless Earbuds Pro",
      "old_price": 1299,
      "new_price": 999,
      "change_pct": -23.2,
      "our_price": 1199,
      "recommendation": "Consider matching at ₹1099 (margin: 18%)"
    }
  ],
  "new_products_found": [],
  "out_of_stock_competitors": ["Competitor B - SKU-123"]
}
```

**Tools Used:**
- `browser_navigate` + `browser_click` + `browser_snapshot` — scrape competitor sites
- `web_extract` — extract pricing from product pages
- `shopify_mcp` — get own product prices
- `agentmemory` — store historical price data
- `write_file` — price history CSV

**Skills Required:**
- `competitor-monitor` (from easyclaw patterns)
- `competitor-spy` (from dainostore)

**Dependencies:**
- Reads: AgentMemory (competitor URLs, price history)
- Calls: Pricing Strategist (when price change >10%)
- Called by: Store Health Monitor (for market signals)
- Triggers: Alert to user when change >5%

**Notes:**
- Uses Bright Data or direct scraping depending on site
- Stores 90 days of price history
- Detects: price drops, price increases, new products, out-of-stock, sales/promotions

---

### Agent 3: Inventory Tracker

| Field | Value |
|-------|-------|
| **Name** | Inventory Tracker |
| **Type** | Cron Job |
| **Schedule** | Every 6 hours |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Monitors stock levels, predicts stockouts from sales velocity, suggests reorder quantities.

**Input:**
- Current inventory levels (Shopify MCP)
- Sales velocity (last 7d, 14d, 30d)
- Lead time per supplier (AgentMemory)
- Reorder point thresholds

**Output:**
```json
{
  "summary": {
    "total_skus": 156,
    "in_stock": 142,
    "low_stock": 11,
    "out_of_stock": 3,
    "overstock": 8
  },
  "alerts": [
    {
      "sku": "WE-PRO-001",
      "product": "Wireless Earbuds Pro",
      "current_stock": 12,
      "daily_velocity": 8.5,
      "days_until_stockout": 1.4,
      "reorder_qty": 200,
      "supplier_lead_time": 7,
      "urgency": "CRITICAL"
    }
  ],
  "overstock_alerts": [
    {
      "sku": "BC-001",
      "product": "Bamboo Case",
      "current_stock": 450,
      "daily_velocity": 1.2,
      "days_of_stock": 375,
      "suggestion": "Run clearance sale"
    }
  ],
  "reorder_suggestions": []
}
```

**Tools Used:**
- `shopify_mcp` — inventory levels, product data, order history
- `agentmemory` — supplier lead times, reorder points, historical velocity
- `write_file` — inventory reports

**Skills Required:**
- `inventory-management` (from dainostore)

**Dependencies:**
- Reads: Shopify orders (for velocity calculation)
- Calls: Pricing Strategist (for overstock clearance pricing)
- Called by: Store Health Monitor (for inventory health score)
- Triggers: Alert to user when stockout < 3 days

**Notes:**
- Velocity calculation: weighted average of 7d/14d/30d
- Seasonal adjustment: higher threshold before festivals
- Overstock threshold: >90 days of stock

---

### Agent 4: Support Watcher

| Field | Value |
|-------|-------|
| **Name** | Support Watcher |
| **Type** | Cron Job |
| **Schedule** | Every 15 minutes |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Monitors customer messages, categorizes them, drafts responses, and escalates urgent issues.

**Input:**
- New customer messages (Shopify MCP — customer data)
- Order history for context (Shopify MCP)
- Store policies (AgentMemory)
- Brand voice guidelines (AgentMemory)

**Output:**
```json
{
  "new_messages": 5,
  "categorized": {
    "order_status": 2,
    "return_request": 1,
    "product_question": 1,
    "complaint": 1
  },
  "drafted_responses": [
    {
      "message_id": "msg-001",
      "customer": "Priya S.",
      "category": "order_status",
      "confidence": 0.95,
      "auto_reply": true,
      "draft": "Hi Priya! Your order #1234 shipped yesterday via Delhivery. Tracking: DL123456789. Expected delivery: July 13. Let me know if you need anything else!"
    },
    {
      "message_id": "msg-002",
      "customer": "Rahul M.",
      "category": "complaint",
      "confidence": 0.72,
      "auto_reply": false,
      "draft": "Hi Rahul, I'm sorry to hear about the issue with your order. I'd like to make this right. Could you share a photo of the damaged item? I'll process a replacement immediately.",
      "escalation_reason": "Complaint — needs human review"
    }
  ]
}
```

**Tools Used:**
- `shopify_mcp` — customer data, order history, messages
- `agentmemory` — store policies, brand voice, response templates
- `llm` (internal) — categorization and response drafting

**Skills Required:**
- `customer-support` (from dainostore patterns)
- `brand-voice`

**Dependencies:**
- Reads: Shopify orders, customer data, AgentMemory
- Calls: Order Processor (for order status queries)
- Called by: Store Health Monitor (for support health)
- Triggers: Alert for complaints (auto-forward to user)

**Notes:**
- High-confidence (>0.9) = auto-reply
- Medium-confidence (0.7-0.9) = draft for user approval
- Low-confidence (<0.7) = escalate to user
- Complaints always escalated regardless of confidence

---

### Agent 5: Analytics Digest

| Field | Value |
|-------|-------|
| **Name** | Analytics Digest |
| **Type** | Cron Job |
| **Schedule** | Daily 9:00 AM |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Pulls ShopifyQL data, generates comprehensive daily briefing for the store owner.

**Input:**
- Shopify analytics data (ShopifyQL queries)
- Previous day/week/month comparisons
- Traffic sources and conversion funnels

**Output:**
```
📊 DAILY BRIEFING — July 11, 2026

━━━ REVENUE ━━━
Yesterday: ₹45,230 (+12% vs last Thursday)
MTD: ₹3,87,450 (on track for ₹12L target)
Best seller: Wireless Earbuds Pro (₹8,900)

━━━ ORDERS ━━━
Yesterday: 23 orders (+8% vs last Thursday)
AOV: ₹1,967 (↑₹120 from last week)
Pending fulfillment: 5 orders

━━━ CONVERSION ━━━
Visitors: 1,847
Conversion: 1.24% (↓0.15% — investigate)
Cart abandonment: 68% (↑3%)
Top exit page: /checkout/shipping

━━━ TOP PRODUCTS ━━━
1. Wireless Earbuds Pro — ₹8,900 (8 units)
2. Bamboo Phone Case — ₹4,300 (10 units)
3. Organic Cotton Tee — ₹3,600 (6 units)

━━━ ACTION ITEMS ━━━
⚠️ Conversion dropped — check shipping page
📦 5 orders need fulfillment
💡 Consider: Shipping page has 3s load time
```

**Tools Used:**
- `shopify_mcp` — ShopifyQL analytics queries
- `agentmemory` — historical data for comparisons
- `text_to_speech` — optional audio briefing
- `write_file` — persist daily reports

**Skills Required:**
- `sales-dashboard` (from dainostore)
- `store-health-check`

**Dependencies:**
- Reads: Shopify analytics, historical data
- Called by: Store Health Monitor (for analytics score)
- Triggers: Morning notification to user

**Notes:**
- Compares to: yesterday, same day last week, month-to-date
- Highlights anomalies (>20% deviation from trend)
- Includes actionable recommendations

---

### Agent 6: Social Media Scheduler

| Field | Value |
|-------|-------|
| **Name** | Social Media Scheduler |
| **Type** | Cron Job |
| **Schedule** | Daily 9:00 AM |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial (text content only) |

**Purpose:** Plans and schedules social media posts using trending topics and product data.

**Input:**
- Product catalog (Shopify MCP)
- Trending topics (Trend Scout data, web_search)
- Brand voice (AgentMemory)
- Content calendar (AgentMemory)
- Engagement history

**Output:**
```json
{
  "date": "2026-07-11",
  "posts_planned": [
    {
      "platform": "instagram",
      "type": "carousel",
      "product": "Wireless Earbuds Pro",
      "caption": "Sound that moves with you 🎧 Our Wireless Earbuds Pro deliver 40hr battery life and ANC that actually works. Link in bio.",
      "hashtags": "#wirelessearbuds #audiophile #techdeals",
      "slides": 5,
      "scheduled_time": "11:00 AM IST",
      "trend_angle": "Monsoon playlist curation"
    },
    {
      "platform": "twitter",
      "type": "thread",
      "topic": "Why we switched from plastic to bamboo cases",
      "tweets": 4,
      "scheduled_time": "2:30 PM IST"
    }
  ],
  "approval_needed": true
}
```

**Tools Used:**
- `shopify_mcp` — product data, images
- `web_search` — trending topics
- `image_generate` — social graphics
- `write_file` — content calendar
- External (Postiz/skill-autoecom) — publishing (future)

**Skills Required:**
- `marketing-copy` (from dainostore)
- `content-engine` (from dainostore)

**Dependencies:**
- Reads: Product catalog, brand voice, trending topics
- Calls: Content Creator (for images), Marketing Copywriter (for captions)
- Called by: Store Health Monitor (for marketing health)
- Triggers: Approval request to user

**Notes:**
- V1: Generates content drafts only (manual posting)
- V2: Auto-publish via Postiz or platform APIs
- Supports: Instagram, Twitter/X, LinkedIn, Facebook

---

### Agent 7: Engagement Responder

| Field | Value |
|-------|-------|
| **Name** | Engagement Responder |
| **Type** | Cron Job |
| **Schedule** | Every 30 minutes |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Monitors social media comments/DMs, drafts contextual replies, auto-replies high-confidence.

**Input:**
- New comments on posts (social APIs)
- New DMs
- Brand voice (AgentMemory)
- Product knowledge base
- Conversation history

**Output:**
```json
{
  "new_interactions": 12,
  "auto_replied": 8,
  "drafted": 3,
  "escalated": 1,
  "replies": [
    {
      "platform": "instagram",
      "type": "comment",
      "user": "@techlover99",
      "message": "Is the noise cancelling good on flights?",
      "confidence": 0.92,
      "reply": "Absolutely! 🙌 Our ANC blocks out engine noise perfectly. Many customers use them on daily commutes and flights. DM us if you have more questions!",
      "auto_sent": true
    }
  ]
}
```

**Tools Used:**
- External social APIs (Instagram, Twitter)
- `agentmemory` — brand voice, response templates
- `shopify_mcp` — product details for questions

**Skills Required:**
- `brand-voice`
- `customer-support` (adapted for social)

**Dependencies:**
- Reads: Brand voice, product knowledge
- Called by: Store Health Monitor (for engagement metrics)
- Triggers: Notification for escalated comments

**Notes:**
- Auto-reply threshold: confidence > 0.9 AND not a complaint
- Complaints always escalated
- Sentiment tracking for engagement analytics

---

### Agent 8: Revenue Tracker

| Field | Value |
|-------|-------|
| **Name** | Revenue Tracker |
| **Type** | Cron Job |
| **Schedule** | Daily (midnight) |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Reconciles orders, payments, and refunds. Tracks revenue, expenses, and margins.

**Input:**
- All orders (Shopify MCP)
- Payment gateway data (Razorpay/Stripe API)
- Refund data
- Expense data (ads, shipping, COGS)

**Output:**
```json
{
  "date": "2026-07-10",
  "revenue": {
    "gross": 52300,
    "refunds": -3200,
    "net": 49100,
    "vs_yesterday": "+8.5%"
  },
  "orders": {
    "total": 26,
    "fulfilled": 21,
    "pending": 5,
    "cancelled": 1,
    "refunded": 2
  },
  "expenses": {
    "cogs": 18500,
    "shipping": 4200,
    "ads": 6800,
    "platform_fees": 1200,
    "total_expenses": 30700
  },
  "profit": {
    "gross_profit": 33800,
    "net_profit": 18400,
    "margin_pct": 37.5
  },
  "mtd_revenue": 387450,
  "mtd_target": 1200000,
  "on_track": false,
  "gap": "Need ₹27K/day avg for remaining 20 days"
}
```

**Tools Used:**
- `shopify_mcp` — orders, refunds
- `agentmemory` — expense data, targets
- `write_file` — financial reports

**Skills Required:**
- `margin-analyzer` (from dainostore)

**Dependencies:**
- Reads: Shopify orders, payment gateway
- Called by: Store Health Monitor (for financial health)
- Triggers: Alert if margin drops below threshold

**Notes:**
- Auto-reconciles Shopify orders with payment gateway
- Tracks: COGS, shipping, ad spend, platform fees
- Generates monthly P&L summary

---

## 4. On-Demand Agents (Subagents) — 12 Agents

---

### Agent 9: Product Lister

| Field | Value |
|-------|-------|
| **Name** | Product Lister |
| **Type** | Subagent |
| **Trigger** | User command (voice, text, image, CSV, URL) |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Creates products from multiple input types — voice, image, CSV, URL, or natural language.

**Input Types:**
| Input | Example |
|-------|---------|
| Voice | "Add a new product: wireless charger, ₹1299, 50 units" |
| Image | Product photo → auto-generate listing |
| CSV | Bulk product import file |
| URL | Competitor product URL → create similar listing |
| Text | "Add the bamboo phone case from AliExpress, ₹299 cost, sell at ₹599" |

**Output:**
```json
{
  "product": {
    "title": "Wireless Fast Charger — 15W Qi Compatible",
    "description": "Charge your devices at lightning speed...",
    "price": 1299,
    "compare_at_price": 1999,
    "sku": "WFC-001",
    "inventory_quantity": 50,
    "tags": ["wireless", "charger", "fast-charge"],
    "seo_title": "Wireless Fast Charger 15W | Fast Delivery India",
    "seo_description": "Buy 15W Qi wireless fast charger...",
    "status": "draft"
  },
  "images_generated": 3,
  "approval_needed": true
}
```

**Tools Used:**
- `shopify_mcp` — create product, upload images
- `image_generate` — product lifestyle images
- `web_extract` — scrape product data from URL
- `terminal` — process CSV files

**Skills Required:**
- `product-listing` (from dainostore)
- `product-launcher` (from dainostore)
- `brand-voice`

**Dependencies:**
- Reads: Brand voice, pricing strategy
- Calls: Marketing Copywriter (for descriptions), SEO Optimizer (for tags), Content Creator (for images)
- Called by: Orchestrator (user command), Bulk Importer
- Triggers: Approval card before publishing

**Notes:**
- All products created as "draft" — require user approval
- Auto-generates: title, description, tags, SEO, images
- Supports variant creation (size, color)

---

### Agent 10: Pricing Strategist

| Field | Value |
|-------|-------|
| **Name** | Pricing Strategist |
| **Type** | Subagent |
| **Trigger** | Competitor price alert, user command, inventory alert |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Analyzes competitor data, margins, and inventory to recommend optimal pricing.

**Input:**
- Competitor price data (from Price Monitor)
- Current product prices and costs (Shopify MCP)
- Inventory levels (for overstock clearance)
- Margin targets (AgentMemory)
- Sales velocity data

**Output:**
```json
{
  "product": "Wireless Earbuds Pro",
  "current_price": 1199,
  "analysis": {
    "competitor_avg": 1099,
    "competitor_min": 899,
    "competitor_max": 1499,
    "our_cost": 450,
    "current_margin": 62.5,
    "position": "above_market"
  },
  "recommendations": [
    {
      "strategy": "match_market",
      "new_price": 1099,
      "new_margin": 59.1,
      "expected_volume_change": "+15%",
      "expected_revenue_change": "+8%"
    },
    {
      "strategy": "premium_position",
      "new_price": 1299,
      "new_margin": 65.4,
      "expected_volume_change": "-5%",
      "expected_revenue_change": "+3%"
    }
  ],
  "recommended": "match_market",
  "reasoning": "Market is price-sensitive, competitor just dropped ₹200. Matching preserves margin while maintaining volume."
}
```

**Tools Used:**
- `shopify_mcp` — products, prices, costs, orders
- `agentmemory` — pricing strategy, margin targets, competitor data
- `web_search` — market benchmarks

**Skills Required:**
- `pricing-optimizer` (from dainostore)
- `margin-analyzer` (from dainostore)
- `bulk-price-update` (from dainostore)

**Dependencies:**
- Reads: Competitor Price Monitor data, Inventory Tracker data
- Called by: Competitor Price Monitor (on significant price change), Inventory Tracker (for overstock clearance)
- Triggers: Approval card before price change

**Notes:**
- Never goes below minimum margin (configurable, default 15%)
- Supports: match competitor, undercut, premium positioning
- Bulk repricing for clearance sales

---

### Agent 11: Landing Page Builder

| Field | Value |
|-------|-------|
| **Name** | Landing Page Builder |
| **Type** | Subagent |
| **Trigger** | User command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Generates landing pages with templates, deploys via Shopify or Cloudflare.

**Input:**
- Product/campaign details
- Template preference
- Target audience
- Key selling points

**Output:**
- Landing page HTML/CSS
- Deployed URL
- A/B variant (optional)

**Tools Used:**
- `shopify_mcp` — create pages
- `write_file` — generate HTML/CSS
- `image_generate` — hero images, product shots
- `terminal` — deploy to Cloudflare Pages

**Skills Required:**
- `landing-page-builder` (custom)

**Dependencies:**
- Reads: Product data, brand voice
- Calls: Marketing Copywriter (for copy), Content Creator (for images), SEO Optimizer (for meta tags)
- Called by: Orchestrator (user command)

**Notes:**
- Templates: Product launch, Sale/Offer, Collection, Brand story
- Auto-generates mobile-responsive pages
- Includes: hero, features, testimonials, CTA, FAQ

---

### Agent 12: SEO Optimizer

| Field | Value |
|-------|-------|
| **Name** | SEO Optimizer |
| **Type** | Subagent |
| **Trigger** | Content Health alert, user command, after product creation |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Keyword research, meta tag generation, content optimization for products and pages.

**Input:**
- Product/page content
- Target keywords (from research)
- Competitor SEO data

**Output:**
```json
{
  "product": "Wireless Earbuds Pro",
  "current_seo_score": 45,
  "optimized_seo_score": 82,
  "changes": {
    "title": {
      "before": "Wireless Earbuds Pro",
      "after": "Wireless Earbuds Pro — 40hr Battery, ANC | Free Delivery"
    },
    "meta_description": {
      "before": "",
      "after": "Buy Wireless Earbuds Pro with Active Noise Cancellation, 40hr battery life. Free delivery across India. ⭐ 4.8/5 rating."
    },
    "keywords_added": ["noise cancelling earbuds", "wireless earbuds india", "long battery earbuds"],
    "alt_text_suggestions": {
      "image_1": "Wireless Earbuds Pro in black - front view with charging case"
    }
  }
}
```

**Tools Used:**
- `web_search` — keyword research, competitor analysis
- `shopify_mcp` — update product SEO fields
- `agentmemory` — keyword database

**Skills Required:**
- `seo-optimization` (from dainostore)

**Dependencies:**
- Reads: Product data, competitor SEO data
- Called by: Product Lister (after creating product), Landing Page Builder
- Triggers: Auto-applies changes (with approval)

---

### Agent 13: Content Creator

| Field | Value |
|-------|-------|
| **Name** | Content Creator |
| **Type** | Subagent |
| **Trigger** | Social Media Scheduler, user command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial (images only) |

**Purpose:** Generates product photos, carousels, reels, branded graphics for marketing.

**Input:**
- Product images/details
- Brand kit (colors, fonts, logo)
- Content type (photo, carousel, reel, graphic)
- Platform specifications

**Output:**
| Content Type | Output |
|-------------|--------|
| Product photo | Lifestyle image with AI background |
| Carousel | 5-slide branded Instagram carousel |
| Reel | 15-60s product video script + storyboard |
| Ad creative | Platform-specific ad image |
| Email banner | Campaign header image |
| Social graphic | Quote card, announcement |

**Tools Used:**
- `image_generate` — product images, social graphics
- `terminal` — FFmpeg for video processing
- `write_file` — content files

**Skills Required:**
- `content-engine` (from dainostore)
- `brand-voice`

**Dependencies:**
- Reads: Product data, brand kit
- Called by: Social Media Scheduler, Landing Page Builder, Marketing Copywriter
- Triggers: Content preview to user

**Notes:**
- V1: Static images only
- V2: Carousels, short videos
- Brand kit stored in AgentMemory

---

### Agent 14: Marketing Copywriter

| Field | Value |
|-------|-------|
| **Name** | Marketing Copywriter |
| **Type** | Subagent |
| **Trigger** | Product Lister, Social Media Scheduler, user command |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Generates product descriptions, ad copy, email copy, social captions.

**Input:**
- Product details
- Target audience
- Platform (Shopify, Instagram, email, etc.)
- Brand voice (AgentMemory)

**Output:**
```json
{
  "product_description": {
    "short": "Premium wireless earbuds with 40hr battery and ANC.",
    "long": "Experience sound like never before. Our Wireless Earbuds Pro deliver studio-quality audio with Active Noise Cancellation that blocks out the world. With 40 hours of battery life, they're perfect for long flights, daily commutes, or focused work sessions.",
    "bullets": [
      "🎧 Active Noise Cancellation — Block out distractions",
      "🔋 40hr Battery — Charge once, listen all week",
      "💧 IPX5 Water Resistant — Gym, rain, no problem",
      "🎵 10mm Drivers — Rich, detailed sound",
      "📱 One-Touch Controls — Manage music and calls"
    ]
  },
  "ad_copy": {
    "google": "Shop Wireless Earbuds Pro — 40hr Battery + ANC. Free Delivery. ★4.8/5.",
    "facebook": "Tired of earbuds that die mid-workout? Our Wireless Earbuds Pro last 40 HOURS on a single charge. Plus, ANC that actually works. 🔥",
    "instagram": "Sound that moves with you 🎧"
  }
}
```

**Tools Used:**
- `shopify_mcp` — product data
- `agentmemory` — brand voice, past copy performance

**Skills Required:**
- `marketing-copy` (from dainostore)
- `brand-voice`

**Dependencies:**
- Reads: Product data, brand voice, audience data
- Called by: Product Lister, Social Media Scheduler, Landing Page Builder, Ad Campaign Manager
- Triggers: Preview to user

---

### Agent 15: Ad Campaign Manager

| Field | Value |
|-------|-------|
| **Name** | Ad Campaign Manager |
| **Type** | Subagent |
| **Trigger** | User command |
| **Priority** | 🟢 P2 |
| **Demo-ready** | ❌ No |

**Purpose:** Creates and manages Google/Meta/TikTok ads, monitors ROAS, adjusts budgets.

**Input:**
- Products to promote
- Budget allocation
- Target audience
- Campaign objectives

**Output:**
- Campaign setup (ad groups, creatives, targeting)
- ROAS monitoring
- Budget adjustment recommendations

**Tools Used:**
- Google Ads API (external)
- Meta Ads API (external)
- `shopify_mcp` — product data, conversion tracking

**Skills Required:**
- `campaign-builder` (from dainostore)

**Dependencies:**
- Reads: Product data, audience segments
- Calls: Content Creator (for ad creatives), Marketing Copywriter (for ad copy)
- Called by: Orchestrator (user command)

**Notes:**
- V1: Generates ad copy and creatives only
- V2: Direct API integration with ad platforms

---

### Agent 16: Email Campaign Builder

| Field | Value |
|-------|-------|
| **Name** | Email Campaign Builder |
| **Type** | Subagent |
| **Trigger** | User command, automated flows |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial (template only) |

**Purpose:** Creates newsletters, abandoned cart flows, win-back campaigns.

**Input:**
- Campaign type (newsletter, abandoned cart, win-back, product launch)
- Product/promotion details
- Audience segment

**Output:**
- Email HTML template
- Subject line options (A/B test)
- Send schedule recommendation
- Audience segment suggestion

**Tools Used:**
- Resend MCP (when available) — send emails
- `shopify_mcp` — customer data, abandoned carts
- `write_file` — email templates

**Skills Required:**
- `campaign-builder` (from dainostore)
- `marketing-copy`

**Dependencies:**
- Reads: Customer data, product data
- Calls: Marketing Copywriter (for email copy), Content Creator (for email images)
- Called by: Orchestrator (user command)

**Notes:**
- V1: Generate email templates
- V2: Send via Resend, track opens/clicks

---

### Agent 17: Shipping Coordinator

| Field | Value |
|-------|-------|
| **Name** | Shipping Coordinator |
| **Type** | Subagent |
| **Trigger** | Order Processor (after order validation) |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial (mock data) |

**Purpose:** Selects carrier, generates labels, books pickup for fulfilled orders.

**Input:**
- Order details (weight, dimensions, destination)
- Available carriers
- Delivery speed preference

**Output:**
```json
{
  "order_id": "1234",
  "carrier_selected": "Delhivery",
  "service": "Express",
  "cost": 85,
  "estimated_delivery": "2026-07-13",
  "tracking_number": "DL123456789",
  "label_url": "https://...",
  "pickup_booked": true,
  "pickup_time": "2026-07-12 10:00-12:00"
}
```

**Tools Used:**
- Shiprocket API (external) — carrier comparison, label generation
- Delhivery API (external) — direct shipping
- `shopify_mcp` — order details, fulfillment

**Skills Required:**
- `ship` (from dainostore — SHIP framework)

**Dependencies:**
- Reads: Order data, address validation
- Called by: Order Processor
- Triggers: Tracking info to customer

**Notes:**
- V1: Mock carrier selection with realistic data
- V2: Real Shiprocket/Delhivery API integration
- Compares: cost, speed, reliability for each carrier

---

### Agent 18: Order Processor

| Field | Value |
|-------|-------|
| **Name** | Order Processor |
| **Type** | Subagent |
| **Trigger** | New order webhook, user command |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Validates addresses, checks inventory, triggers fulfillment for new orders.

**Input:**
- New order data (Shopify MCP)
- Inventory availability
- Address validation

**Output:**
```json
{
  "order_id": "#1234",
  "status": "validated",
  "checks": {
    "address_valid": true,
    "inventory_available": true,
    "fraud_check": "passed",
    "payment_captured": true
  },
  "fulfillment": {
    "ready": true,
    "items": [
      {"sku": "WE-PRO-001", "product": "Wireless Earbuds Pro", "qty": 1}
    ],
    "warehouse": "Mumbai"
  },
  "next_step": "shipping_coordinator"
}
```

**Tools Used:**
- `shopify_mcp` — orders, inventory, customers
- Address validation API (external)

**Skills Required:**
- `order-autopilot` (from dainostore)

**Dependencies:**
- Reads: Order data, inventory data
- Calls: Shipping Coordinator (for label generation)
- Called by: Support Watcher (for order status queries), Orchestrator

**Notes:**
- Validates: address format, inventory availability, fraud signals
- Fraud checks: unusual amount, address mismatch, velocity
- Auto-marks as "Ready for Fulfillment" on passing all checks

---

### Agent 19: Bulk Importer

| Field | Value |
|-------|-------|
| **Name** | Bulk Importer |
| **Type** | Subagent |
| **Trigger** | User uploads CSV/Excel file |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Processes CSV/Excel files, validates data, creates products in batch.

**Input:**
- CSV/Excel file with product data
- Column mapping (auto-detected or manual)

**Output:**
```json
{
  "file": "products_july.csv",
  "total_rows": 150,
  "valid": 145,
  "invalid": 5,
  "errors": [
    {"row": 23, "error": "Missing required field: price"},
    {"row": 67, "error": "Invalid SKU format"},
    {"row": 89, "error": "Duplicate SKU: WE-PRO-001"},
    {"row": 112, "error": "Price must be positive"},
    {"row": 134, "error": "Category not found: 'Electronics > Audio'"}
  ],
  "products_created": 145,
  "approval_needed": true
}
```

**Tools Used:**
- `terminal` — parse CSV/Excel
- `shopify_mcp` — create products in batch

**Skills Required:**
- `product-listing` (adapted for bulk)

**Dependencies:**
- Calls: Product Lister (for each valid row)
- Called by: Orchestrator (user uploads file)

**Notes:**
- Supports: CSV, Excel (.xlsx), JSON
- Auto-detects column mapping
- Validates: required fields, data types, duplicates
- Creates all as "draft" for user review

---

### Agent 20: Store Setup Agent

| Field | Value |
|-------|-------|
| **Name** | Store Setup Agent |
| **Type** | Subagent |
| **Trigger** | First-time setup, user command |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Guides initial store configuration — theme, pages, shipping, payments.

**Input:**
- Store type (fashion, electronics, food, etc.)
- Business details (name, logo, description)
- Shipping preferences
- Payment gateway setup

**Output:**
```json
{
  "setup_complete": true,
  "configured": {
    "store_name": "TechVibe India",
    "store_description": "Premium tech accessories for the modern Indian consumer",
    "theme": "Dawn (customized)",
    "pages_created": ["About Us", "Contact", "Shipping Policy", "Return Policy", "FAQ"],
    "shipping_zones": [
      {"zone": "India", "rate": "Free above ₹999", "carrier": "Delhivery"},
      {"zone": "International", "rate": "₹599 flat", "carrier": "DHL"}
    ],
    "payment_gateways": ["Razorpay", "UPI"],
    "tax_config": {"GST": "18%", "auto_calculate": true}
  },
  "products_imported": 0,
  "next_steps": ["Import products", "Connect domain", "Set up analytics"]
}
```

**Tools Used:**
- `shopify_mcp` — store configuration, pages, shipping, payments
- `write_file` — policy pages, FAQ content
- `image_generate` — store banner, logo suggestions

**Skills Required:**
- `store-setup` (custom)

**Dependencies:**
- Calls: SEO Optimizer (for store SEO), Landing Page Builder (for policy pages)
- Called by: Orchestrator (first-time user)

**Notes:**
- Interactive wizard flow
- Creates all essential pages with SEO-optimized content
- Configures shipping zones for India (primary market)
- Sets up basic analytics tracking

---

## 5. Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATOR (Main Chat)                           │
│                    Routes user commands to appropriate agent                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ ALWAYS-ON     │         │ ON-DEMAND     │         │ EXTERNAL      │
│ CRON JOBS     │         │ SUBAGENTS     │         │ SERVICES      │
└───────────────┘         └───────────────┘         └───────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         AGENT DEPENDENCY FLOW
═══════════════════════════════════════════════════════════════════════════════

Store Health Monitor ─────────────────────────────────────────────────────────┐
  │ reads metrics from:                                                       │
  ├──► Competitor Price Monitor ──┐                                           │
  │    │ scrapes via:             │                                           │
  │    └──► browser_* tools       │                                           │
  │                               ▼                                           │
  ├──► Inventory Tracker ────► Pricing Strategist (on overstock)              │
  │    │ reads: shopify_mcp      │ reads: competitor data + margins           │
  │    └──► triggers reorder     └──► approval → shopify_mcp                  │
  │                                                                           │
  ├──► Support Watcher ─────► Order Processor (for order status)              │
  │    │ reads: shopify_mcp      │ validates → Shipping Coordinator           │
  │    └──► auto-replies         └──► Shiprocket/Delhivery APIs               │
  │                                                                           │
  ├──► Analytics Digest                                                         │
  │    └──► reads: shopify_mcp (ShopifyQL)                                    │
  │                                                                           │
  ├──► Social Media Scheduler                                                 │
  │    ├──► calls: Content Creator (images)                                   │
  │    ├──► calls: Marketing Copywriter (captions)                            │
  │    └──► calls: SEO Optimizer (hashtags)                                   │
  │                                                                           │
  ├──► Engagement Responder                                                   │
  │    └──► reads: brand voice from AgentMemory                               │
  │                                                                           │
  └──► Revenue Tracker                                                        │
       └──► reconciles: orders + payments + refunds                           │

═══════════════════════════════════════════════════════════════════════════════
                         ON-DEMAND AGENT FLOWS
═══════════════════════════════════════════════════════════════════════════════

Product Lister ──────────────────────────────────────────────────────────────┐
  │ calls:                                                                    │
  ├──► Marketing Copywriter (descriptions, bullets, SEO copy)                │
  ├──► SEO Optimizer (keywords, meta tags)                                   │
  ├──► Content Creator (product images)                                      │
  └──► Bulk Importer (for CSV/Excel batch imports)                           │

Landing Page Builder ────────────────────────────────────────────────────────┐
  │ calls:                                                                    │
  ├──► Marketing Copywriter (page copy)                                      │
  ├──► Content Creator (hero images, graphics)                               │
  └──► SEO Optimizer (meta tags, keywords)                                   │

Ad Campaign Manager ─────────────────────────────────────────────────────────┐
  │ calls:                                                                    │
  ├──► Marketing Copywriter (ad copy)                                        │
  └──► Content Creator (ad creatives)                                        │

Email Campaign Builder ──────────────────────────────────────────────────────┐
  │ calls:                                                                    │
  ├──► Marketing Copywriter (email copy)                                     │
  └──► Content Creator (email banners)                                       │

Store Setup Agent ───────────────────────────────────────────────────────────┐
  │ calls:                                                                    │
  ├──► SEO Optimizer (store-wide SEO)                                        │
  └──► Landing Page Builder (policy pages)                                   │

═══════════════════════════════════════════════════════════════════════════════
                         CROSS-AGENT TRIGGERS
═══════════════════════════════════════════════════════════════════════════════

Competitor Price Monitor ──(price drop >10%)──► Pricing Strategist
Inventory Tracker ──(stockout <3 days)──► Alert to User
Inventory Tracker ──(overstock >90 days)──► Pricing Strategist
Support Watcher ──(order status query)──► Order Processor
Order Processor ──(validated order)──► Shipping Coordinator
Content Health ──(low SEO score)──► SEO Optimizer
Social Media Scheduler ──(daily)──► Content Creator + Marketing Copywriter
```

---

## 6. Priority Matrix

### 🔴 P0 — Must-Have for Demo (8 agents)

| # | Agent | Type | Why P0 |
|---|-------|------|--------|
| 1 | Store Health Monitor | Cron | Core value prop — "one dashboard for everything" |
| 2 | Competitor Price Monitor | Cron | Killer demo feature — live competitor tracking |
| 3 | Inventory Tracker | Cron | Essential for store ops |
| 4 | Support Watcher | Cron | Customer-facing, high impact |
| 5 | Analytics Digest | Cron | Daily briefing is wow factor |
| 8 | Revenue Tracker | Cron | Financial awareness |
| 9 | Product Lister | Subagent | Core CRUD operation |
| 10 | Pricing Strategist | Subagent | Intelligence layer |
| 14 | Marketing Copywriter | Subagent | Content generation |
| 18 | Order Processor | Subagent | Order fulfillment |
| 20 | Store Setup Agent | Subagent | First-time experience |

### 🟡 P1 — Nice-to-Have (8 agents)

| # | Agent | Type | Why P1 |
|---|-------|------|--------|
| 6 | Social Media Scheduler | Cron | Marketing automation |
| 7 | Engagement Responder | Cron | Social presence |
| 11 | Landing Page Builder | Subagent | Conversion optimization |
| 12 | SEO Optimizer | Subagent | Organic traffic |
| 13 | Content Creator | Subagent | Visual content |
| 16 | Email Campaign Builder | Subagent | Email marketing |
| 17 | Shipping Coordinator | Subagent | Fulfillment |
| 19 | Bulk Importer | Subagent | Scale operations |

### 🟢 P2 — Post-Hackathon (4 agents)

| # | Agent | Type | Why P2 |
|---|-------|------|--------|
| 15 | Ad Campaign Manager | Subagent | Requires ad platform APIs |

---

## 7. Demo Flow

### 8-Minute Demo Script

```
[0:00 - 1:00] INTRO
  "Meet HermesStore — your AI store manager."
  Show: Store Health Monitor dashboard (score: 78/100)

[1:00 - 2:00] PRODUCT CREATION
  "Let me add a product by voice."
  → Product Lister creates listing with AI-generated description + images

[2:00 - 3:00] COMPETITOR INTELLIGENCE
  "Our competitor just dropped their price."
  → Competitor Price Monitor shows live comparison
  → Pricing Strategist recommends response

[3:00 - 4:00] INVENTORY & ORDERS
  "We're running low on stock."
  → Inventory Tracker shows stockout prediction
  → Order Processor validates pending order
  → Shipping Coordinator selects carrier

[4:00 - 5:00] CUSTOMER SUPPORT
  "A customer has a question."
  → Support Watcher categorizes and drafts response
  → Auto-reply sent for order status query

[5:00 - 6:00] MARKETING
  "Generate today's social media content."
  → Marketing Copywriter creates captions
  → Content Creator generates product images
  → Social Media Scheduler plans posts

[6:00 - 7:00] ANALYTICS
  "How's the store doing?"
  → Analytics Digest shows daily briefing
  → Revenue Tracker shows financial summary

[7:00 - 8:00] CLOSING
  "All of this runs automatically, 24/7."
  Show: Agent activity feed, cron schedules, alert history
```

---

## 8. MCP Tools Registry

### Shopify MCP (75+ tools)

| Category | Tools | Used By |
|----------|-------|---------|
| Products | create, update, delete, list, search | Product Lister, Bulk Importer, Pricing Strategist |
| Orders | list, update, fulfill, refund | Order Processor, Revenue Tracker, Support Watcher |
| Customers | list, search, segments | Support Watcher, Email Campaign Builder |
| Inventory | levels, adjust, locations | Inventory Tracker |
| Analytics | ShopifyQL, sales, traffic | Analytics Digest, Store Health Monitor |
| Pages | create, update, delete | Landing Page Builder, Store Setup Agent |
| Discounts | create, update, delete | Pricing Strategist |
| Metafields | CRUD | All agents (for custom data) |

### Hermes Built-in Tools

| Tool | Used By |
|------|---------|
| `web_search` | Competitor Price Monitor, SEO Optimizer, Pricing Strategist |
| `browser_*` | Competitor Price Monitor (scraping) |
| `image_generate` | Content Creator, Product Lister |
| `terminal` | Bulk Importer, Shipping Coordinator |
| `write_file` | Landing Page Builder, Email Campaign Builder |
| `agentmemory` | All agents (persistent context) |
| `text_to_speech` | Analytics Digest (audio briefing) |

### External APIs (V2+)

| API | Agent | Status |
|-----|-------|--------|
| Shiprocket | Shipping Coordinator | V2 |
| Delhivery | Shipping Coordinator | V2 |
| Razorpay | Revenue Tracker | V2 |
| Resend | Email Campaign Builder | V2 |
| Google Ads | Ad Campaign Manager | V2 |
| Meta Ads | Ad Campaign Manager | V2 |
| Instagram API | Engagement Responder | V2 |
| Twitter API | Engagement Responder | V2 |

---

## 9. Implementation Order

### Hour 0-2: Foundation
1. ✅ Store Setup Agent (interactive wizard)
2. ✅ Product Lister (core CRUD)
3. ✅ Marketing Copywriter (descriptions)

### Hour 2-4: Intelligence
4. ✅ Competitor Price Monitor (cron)
5. ✅ Pricing Strategist (recommendations)
6. ✅ Inventory Tracker (cron)

### Hour 4-6: Operations
7. ✅ Order Processor (validation)
8. ✅ Support Watcher (cron)
9. ✅ Analytics Digest (cron)
10. ✅ Revenue Tracker (cron)

### Hour 6-7: Monitoring
11. ✅ Store Health Monitor (aggregator)
12. ✅ SEO Optimizer (meta tags)

### Hour 7-8: Polish & Demo
13. ✅ Content Creator (images)
14. ✅ Social Media Scheduler (drafts)
15. 🎬 Demo rehearsal

---

## Appendix A: Agent Skill Mapping

| Agent | Skills (from dainostore) | Custom Skills |
|-------|--------------------------|---------------|
| Store Health Monitor | `store-health-check`, `sales-dashboard` | `health-aggregator` |
| Competitor Price Monitor | `competitor-spy` | `price-scraper` |
| Inventory Tracker | `inventory-management` | `stockout-predictor` |
| Support Watcher | — | `support-categorizer`, `response-drafter` |
| Analytics Digest | `sales-dashboard` | `daily-briefing` |
| Social Media Scheduler | `marketing-copy`, `content-engine` | `social-planner` |
| Engagement Responder | — | `engagement-responder` |
| Revenue Tracker | `margin-analyzer` | `revenue-reconciler` |
| Product Lister | `product-listing`, `product-launcher` | `multi-input-listing` |
| Pricing Strategist | `pricing-optimizer`, `margin-analyzer`, `bulk-price-update` | `price-recommender` |
| Landing Page Builder | — | `page-builder` |
| SEO Optimizer | `seo-optimization` | `keyword-researcher` |
| Content Creator | `content-engine` | `image-generator` |
| Marketing Copywriter | `marketing-copy` | `copy-generator` |
| Ad Campaign Manager | `campaign-builder` | `ad-manager` |
| Email Campaign Builder | `campaign-builder` | `email-builder` |
| Shipping Coordinator | `ship` (SHIP framework) | `carrier-selector` |
| Order Processor | `order-autopilot` | `order-validator` |
| Bulk Importer | `product-listing` | `csv-processor` |
| Store Setup Agent | — | `store-wizard` |

---

## Appendix B: Token Budget Estimate (V1)

| Agent Category | Agents | Daily Runs | Tokens/Run | Daily Total |
|---------------|--------|------------|------------|-------------|
| Always-on Crons | 8 | varies | 5K-15K | ~80K |
| On-demand (avg 10/day) | 12 | 10 | 10K-20K | ~150K |
| Orchestrator routing | 1 | 50 | 2K | ~100K |
| **Total** | | | | **~330K/day** |

**Monthly estimate:** ~10M tokens → ~₹300/month (with MiMo pricing)

---

*This document defines the V1 agent architecture for the GrowthX Hermes Buildathon.*
*For the full 32-agent architecture, see HermesStore-Project-Document.md.*
*Last updated: July 11, 2026*
