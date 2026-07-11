# AGENTS-V1-EVENT.md — HermesStore Agent Definitions (Event/Profile Edition)

> **Version:** 1.0-event
> **Created:** July 11, 2026
> **Total Agents:** 15 across 4 profiles
> **Platform:** Hermes Agent + Hermes API Server

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Hermes API Server Integration](#2-hermes-api-server-integration)
3. [Profile: hermesstore-brain (port 8642)](#3-profile-hermesstore-brain-port-8642)
4. [Profile: hermesstore-storeops (port 8643)](#4-profile-hermesstore-storeops-port-8643)
5. [Profile: hermesstore-marketing (port 8644)](#5-profile-hermesstore-marketing-port-8644)
6. [Profile: hermesstore-customer-brand (port 8645)](#6-profile-hermesstore-customer-brand-port-8645)
7. [Priority Matrix](#7-priority-matrix)
8. [Implementation Order](#8-implementation-order)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    hermesstore-brain :8642                       │
│              Request Router · Conflict Resolver · Demo Presenter │
└────────────────────────────┬────────────────────────────────────┘
                             │ routes/delegates
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│ storeops :8643│  │ marketing :8644  │  │ customer-brand :8645   │
│ Product Lister│  │ Social Media Mgr │  │ Support Agent          │
│ Pricing Strat │  │ Content Creator  │  │ Copywriter             │
│ Landing Page  │  │ Promo Sender     │  │ Brand Guardian         │
│ SEO Optimizer │  │ Engagement Rspdr │  │                        │
│ Inventory Trk │  │                  │  │                        │
└───────────────┘  └──────────────────┘  └────────────────────────┘
```

### Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 P0 | Must-have for demo |
| 🟡 P1 | Nice-to-have for demo |
| ✅ | Demo-ready |
| ⚠️ | Partial demo |

---

## 2. Hermes API Server Integration

All agents communicate through the **Hermes API Server** (port per profile). Cron agents use `/api/jobs`, on-demand agents use `/v1/runs`.

### Cron Job API

```bash
# Create
POST /api/jobs
{ "name": "...", "skill": "...", "schedule": { "every": "30m" }, "toolsets": [...], "payload": { "prompt": "..." } }

# Manage
GET    /api/jobs
PATCH  /api/jobs/{job_id}
POST   /api/jobs/{job_id}/trigger
POST   /api/jobs/{job_id}/pause
POST   /api/jobs/{job_id}/resume
DELETE /api/jobs/{job_id}
```

### On-Demand Agent API

```bash
# Trigger
POST /v1/runs
{ "skill": "...", "toolsets": [...], "input": { "prompt": "..." } }

# Track
GET  /v1/runs/{run_id}
GET  /v1/runs/{run_id}/events          # SSE stream
POST /v1/runs/{run_id}/cancel
POST /v1/runs/{run_id}/approval        # human-in-the-loop
```

---

## 3. Profile: hermesstore-brain (port 8642)

Central routing, conflict resolution, and demo presentation layer.

---

### Agent 1: Request Router

| Field | Value |
|-------|-------|
| **Name** | Request Router |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | Every user request |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Routes user requests to the correct department profile (storeops, marketing, customer-brand).

**Input:** Raw user message (voice, text, command)

**Output:**
```json
{
  "intent": "create_product",
  "department": "hermesstore-storeops",
  "agent": "product-lister",
  "confidence": 0.95,
  "delegated": true
}
```

**Tools:** `agentmemory`, `web_search`

**Skill File:** `request-router`

**Hermes API Call:**
```bash
POST http://localhost:8642/v1/runs
{
  "skill": "request-router",
  "toolsets": ["agentmemory"],
  "input": { "prompt": "Route: 'Add wireless charger ₹1299'" }
}
```

---

### Agent 2: Conflict Resolver

| Field | Value |
|-------|-------|
| **Name** | Conflict Resolver |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | When departments conflict |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Handles conflicts between departments (e.g., pricing agent wants to lower price but inventory agent says stock is low — don't discount scarce items).

**Input:** Conflict context from two departments (pricing vs inventory, marketing vs brand voice, etc.)

**Output:**
```json
{
  "conflict": "pricing_vs_inventory",
  "resolution": "hold_price",
  "reasoning": "Stock is below 7-day supply. Do not discount until restock.",
  "agents_involved": ["pricing-strategist", "inventory-tracker"]
}
```

**Tools:** `agentmemory`

**Skill File:** `conflict-resolver`

**Hermes API Call:**
```bash
POST http://localhost:8642/v1/runs
{
  "skill": "conflict-resolver",
  "toolsets": ["agentmemory"],
  "input": {
    "prompt": "Resolve: Pricing Strategist wants ₹999 for WE-PRO-001 but Inventory Tracker says only 12 units left (1.4 days stock)."
  }
}
```

---

### Agent 3: Demo Presenter

| Field | Value |
|-------|-------|
| **Name** | Demo Presenter |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | Demo/showcase mode |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Formats agent responses into demo-friendly output — clean cards, visual summaries, talking points for live presentation.

**Input:** Raw agent output (JSON), demo context (which slide/segment)

**Output:**
```json
{
  "demo_card": {
    "title": "🔥 New Product Added",
    "subtitle": "Wireless Fast Charger — ₹1,299",
    "highlights": ["AI-generated listing", "3 lifestyle images", "SEO-optimized"],
    "talking_point": "This took 10 seconds. A human would need 30 minutes."
  }
}
```

**Tools:** `image_generate`, `write_file`

**Skill File:** `demo-presenter`

**Hermes API Call:**
```bash
POST http://localhost:8642/v1/runs
{
  "skill": "demo-presenter",
  "toolsets": ["image_generate", "write_file"],
  "input": {
    "prompt": "Format for demo: Product Lister just created 'Wireless Fast Charger' at ₹1299 with 3 images."
  }
}
```

---

## 4. Profile: hermesstore-storeops (port 8643)

Store operations — products, pricing, pages, SEO, inventory.

---

### Agent 4: Product Lister

| Field | Value |
|-------|-------|
| **Name** | Product Lister |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command (voice/text/image/CSV) |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Creates products from voice, image, text, or CSV input. Auto-generates title, description, tags, SEO, and images.

**Input:** Product details via voice, image, text, CSV, or URL

**Output:**
```json
{
  "product": {
    "title": "Wireless Fast Charger — 15W Qi Compatible",
    "price": 1299,
    "status": "draft",
    "images_generated": 3
  },
  "approval_needed": true
}
```

**Tools:** `shopify_mcp`, `image_generate`, `web_extract`, `terminal`

**Skill File:** `product-listing`

**Hermes API Call:**
```bash
POST http://localhost:8643/v1/runs
{
  "skill": "product-listing",
  "toolsets": ["shopify_mcp", "image_generate", "web_extract", "terminal"],
  "input": { "prompt": "Add wireless charger, ₹1299, 50 units" }
}
```

---

### Agent 5: Pricing Strategist

| Field | Value |
|-------|-------|
| **Name** | Pricing Strategist |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command, competitor alert, inventory alert |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Competitive pricing recommendations based on competitor data, margins, and inventory levels.

**Input:** Product SKU or name, competitor data, margin targets

**Output:**
```json
{
  "product": "Wireless Earbuds Pro",
  "current_price": 1199,
  "recommendations": [
    { "strategy": "match_market", "new_price": 1099, "margin": 59.1, "volume_change": "+15%" },
    { "strategy": "premium_position", "new_price": 1299, "margin": 65.4, "volume_change": "-5%" }
  ],
  "recommended": "match_market"
}
```

**Tools:** `shopify_mcp`, `agentmemory`, `web_search`

**Skill File:** `pricing-optimizer`

**Hermes API Call:**
```bash
POST http://localhost:8643/v1/runs
{
  "skill": "pricing-optimizer",
  "toolsets": ["shopify_mcp", "agentmemory", "web_search"],
  "input": { "prompt": "Recommend pricing for Wireless Earbuds Pro. Competitor just dropped to ₹999." }
}
```

---

### Agent 6: Landing Page Builder

| Field | Value |
|-------|-------|
| **Name** | Landing Page Builder |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Generates landing pages with templates, deploys to Cloudflare Pages.

**Input:** Product/campaign details, template preference, target audience

**Output:** Landing page HTML/CSS, deployed URL

**Tools:** `shopify_mcp`, `write_file`, `image_generate`, `terminal`

**Skill File:** `page-builder`

**Hermes API Call:**
```bash
POST http://localhost:8643/v1/runs
{
  "skill": "page-builder",
  "toolsets": ["shopify_mcp", "write_file", "image_generate", "terminal"],
  "input": { "prompt": "Create a product launch page for Wireless Earbuds Pro." }
}
```

---

### Agent 7: SEO Optimizer

| Field | Value |
|-------|-------|
| **Name** | SEO Optimizer |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | After product creation, user command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Keyword research, meta tag generation, content optimization for products and pages.

**Input:** Product/page content, target keywords

**Output:**
```json
{
  "product": "Wireless Earbuds Pro",
  "seo_score_before": 45,
  "seo_score_after": 82,
  "changes": {
    "title": "Wireless Earbuds Pro — 40hr Battery, ANC | Free Delivery",
    "meta_description": "Buy Wireless Earbuds Pro with Active Noise Cancellation...",
    "keywords_added": ["noise cancelling earbuds", "wireless earbuds india"]
  }
}
```

**Tools:** `web_search`, `shopify_mcp`, `agentmemory`

**Skill File:** `seo-optimization`

**Hermes API Call:**
```bash
POST http://localhost:8643/v1/runs
{
  "skill": "seo-optimization",
  "toolsets": ["web_search", "shopify_mcp", "agentmemory"],
  "input": { "prompt": "Optimize SEO for Wireless Earbuds Pro product page." }
}
```

---

### Agent 8: Inventory Tracker

| Field | Value |
|-------|-------|
| **Name** | Inventory Tracker |
| **Type** | Cron Job |
| **Schedule** | Every 6 hours |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Monitors stock levels, predicts stockouts from sales velocity, suggests reorder quantities.

**Input:** Current inventory, sales velocity (7d/14d/30d), supplier lead times

**Output:**
```json
{
  "summary": { "total_skus": 156, "in_stock": 142, "low_stock": 11, "out_of_stock": 3 },
  "alerts": [
    { "sku": "WE-PRO-001", "days_until_stockout": 1.4, "reorder_qty": 200, "urgency": "CRITICAL" }
  ]
}
```

**Tools:** `shopify_mcp`, `agentmemory`

**Skill File:** `inventory-management`

**Hermes API Call:**
```bash
POST http://localhost:8643/api/jobs
{
  "name": "inventory-tracker",
  "skill": "inventory-management",
  "schedule": { "every": "6h" },
  "toolsets": ["shopify_mcp", "agentmemory"],
  "payload": { "prompt": "Check stock levels, predict stockouts, suggest reorders." }
}
```

---

## 5. Profile: hermesstore-marketing (port 8644)

Marketing — social media, content creation, promos, engagement.

---

### Agent 9: Social Media Manager

| Field | Value |
|-------|-------|
| **Name** | Social Media Manager |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Generates social posts for multiple platforms (Instagram, Twitter/X, LinkedIn, Facebook).

**Input:** Product/campaign details, platform, brand voice

**Output:**
```json
{
  "posts": [
    {
      "platform": "instagram",
      "type": "carousel",
      "caption": "Sound that moves with you 🎧 ...",
      "hashtags": "#wirelessearbuds #audiophile",
      "scheduled_time": "11:00 AM IST"
    }
  ],
  "approval_needed": true
}
```

**Tools:** `shopify_mcp`, `web_search`, `image_generate`

**Skill File:** `social-planner`

**Hermes API Call:**
```bash
POST http://localhost:8644/v1/runs
{
  "skill": "social-planner",
  "toolsets": ["shopify_mcp", "web_search", "image_generate"],
  "input": { "prompt": "Generate Instagram carousel for Wireless Earbuds Pro. Monsoon theme." }
}
```

---

### Agent 10: Content Creator

| Field | Value |
|-------|-------|
| **Name** | Content Creator |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command, Social Media Manager request |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial (images only) |

**Purpose:** Generates product images, carousels, branded graphics for marketing.

**Input:** Product images/details, brand kit, content type, platform specs

**Output:** Product lifestyle images, social graphics, carousel slides, email banners

**Tools:** `image_generate`, `terminal`, `write_file`

**Skill File:** `content-engine`

**Hermes API Call:**
```bash
POST http://localhost:8644/v1/runs
{
  "skill": "content-engine",
  "toolsets": ["image_generate", "terminal", "write_file"],
  "input": { "prompt": "Generate 3 lifestyle images for Wireless Earbuds Pro. Studio lighting, modern setting." }
}
```

---

### Agent 11: Promo Sender

| Field | Value |
|-------|-------|
| **Name** | Promo Sender |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Sends WhatsApp promotional messages with payment links.

**Input:** Target audience segment, promo message, product, discount code

**Output:**
```json
{
  "campaign": "monsoon-sale-2026",
  "audience_size": 2500,
  "message_sent": true,
  "payment_link": "https://store.com/pay/abc123",
  "delivery_status": { "sent": 2500, "delivered": 2480, "failed": 20 }
}
```

**Tools:** `shopify_mcp`, `agentmemory`

**Skill File:** `promo-sender`

**Hermes API Call:**
```bash
POST http://localhost:8644/v1/runs
{
  "skill": "promo-sender",
  "toolsets": ["shopify_mcp", "agentmemory"],
  "input": { "prompt": "Send WhatsApp promo: 20% off Wireless Earbuds Pro to last 30-day customers. Include payment link." }
}
```

---

### Agent 12: Engagement Responder

| Field | Value |
|-------|-------|
| **Name** | Engagement Responder |
| **Type** | Cron Job |
| **Schedule** | Every 30 minutes |
| **Priority** | 🟡 P1 |
| **Demo-ready** | ⚠️ Partial |

**Purpose:** Monitors and replies to social media comments and DMs. Auto-replies high-confidence responses, drafts others.

**Input:** New comments/DMs, brand voice, product knowledge base

**Output:**
```json
{
  "new_interactions": 12,
  "auto_replied": 8,
  "drafted": 3,
  "escalated": 1,
  "replies": [
    { "platform": "instagram", "user": "@techlover99", "message": "Is ANC good on flights?", "confidence": 0.92, "auto_sent": true }
  ]
}
```

**Tools:** `shopify_mcp`, `agentmemory`

**Skill File:** `engagement-responder`

**Hermes API Call:**
```bash
POST http://localhost:8644/api/jobs
{
  "name": "engagement-responder",
  "skill": "engagement-responder",
  "schedule": { "every": "30m" },
  "toolsets": ["shopify_mcp", "agentmemory"],
  "payload": { "prompt": "Monitor social comments/DMs. Auto-reply if confidence >0.9. Draft for approval if 0.7-0.9. Escalate complaints." }
}
```

---

## 6. Profile: hermesstore-customer-brand (port 8645)

Customer support, copywriting, and brand consistency.

---

### Agent 13: Support Agent

| Field | Value |
|-------|-------|
| **Name** | Support Agent |
| **Type** | Cron Job |
| **Schedule** | Every 15 minutes |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Handles customer queries, categorizes messages, drafts responses, escalates urgent issues.

**Input:** New customer messages, order history, store policies, brand voice

**Output:**
```json
{
  "new_messages": 5,
  "categorized": { "order_status": 2, "return_request": 1, "product_question": 1, "complaint": 1 },
  "drafted_responses": [
    { "message_id": "msg-001", "category": "order_status", "confidence": 0.95, "auto_reply": true },
    { "message_id": "msg-002", "category": "complaint", "confidence": 0.72, "auto_reply": false, "escalation_reason": "Complaint — needs human review" }
  ]
}
```

**Tools:** `shopify_mcp`, `agentmemory`

**Skill File:** `customer-support`

**Hermes API Call:**
```bash
POST http://localhost:8645/api/jobs
{
  "name": "support-agent",
  "skill": "customer-support",
  "schedule": { "every": "15m" },
  "toolsets": ["shopify_mcp", "agentmemory"],
  "payload": { "prompt": "Check new customer messages. Auto-reply high-confidence order status. Draft for approval otherwise. Escalate complaints." }
}
```

---

### Agent 14: Copywriter

| Field | Value |
|-------|-------|
| **Name** | Copywriter |
| **Type** | On-demand (subagent) |
| **Schedule/Trigger** | User command, other agent requests |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Generates product descriptions, ad copy, email copy, social captions — all in brand voice.

**Input:** Product details, target audience, platform (Shopify, Instagram, email, etc.)

**Output:**
```json
{
  "product_description": {
    "short": "Premium wireless earbuds with 40hr battery and ANC.",
    "long": "Experience sound like never before...",
    "bullets": ["🎧 Active Noise Cancellation", "🔋 40hr Battery", "💧 IPX5 Water Resistant"]
  },
  "ad_copy": {
    "google": "Shop Wireless Earbuds Pro — 40hr Battery + ANC. Free Delivery.",
    "facebook": "Tired of earbuds that die mid-workout? ...",
    "instagram": "Sound that moves with you 🎧"
  }
}
```

**Tools:** `shopify_mcp`, `agentmemory`

**Skill File:** `marketing-copy`

**Hermes API Call:**
```bash
POST http://localhost:8645/v1/runs
{
  "skill": "marketing-copy",
  "toolsets": ["shopify_mcp", "agentmemory"],
  "input": { "prompt": "Write product description + ad copy for Wireless Earbuds Pro. Target: young professionals." }
}
```

---

### Agent 15: Brand Guardian

| Field | Value |
|-------|-------|
| **Name** | Brand Guardian |
| **Type** | Always-on (memory-backed) |
| **Schedule/Trigger** | Passive — enforced across all agents via shared memory |
| **Priority** | 🔴 P0 |
| **Demo-ready** | ✅ Yes |

**Purpose:** Enforces brand voice, tone, and visual identity across all agents. Stores brand guidelines in AgentMemory so every agent reads and follows them.

**Input:** Brand kit (colors, fonts, logo), voice guidelines, tone rules, banned words

**Output:** Brand compliance score per agent output, correction suggestions

**Tools:** `agentmemory`

**Skill File:** `brand-voice`

**Hermes API Call (to update brand guidelines):**
```bash
POST http://localhost:8645/v1/runs
{
  "skill": "brand-voice",
  "toolsets": ["agentmemory"],
  "input": { "prompt": "Update brand voice: casual-professional, emoji-friendly, avoid jargon. Colors: #FF6B35 primary, #004E89 secondary." }
}
```

**How it works:**
- Brand Guardian writes guidelines to AgentMemory
- All other agents read brand-voice from AgentMemory before generating content
- Copywriter and Content Creator are the primary consumers
- No active cron — it's a persistent memory contract

---

## 7. Priority Matrix

### 🔴 P0 — Must-Have for Demo (7 agents)

| # | Agent | Profile | Type | Why P0 |
|---|-------|---------|------|--------|
| 1 | Request Router | brain | On-demand | Routes everything — core orchestration |
| 3 | Demo Presenter | brain | On-demand | Makes demo look polished |
| 4 | Product Lister | storeops | On-demand | Core CRUD — "add a product by voice" |
| 5 | Pricing Strategist | storeops | On-demand | Intelligence layer — competitor response |
| 8 | Inventory Tracker | storeops | Cron 6h | Essential store ops |
| 13 | Support Agent | customer-brand | Cron 15m | Customer-facing, high impact |
| 14 | Copywriter | customer-brand | On-demand | Content generation backbone |
| 15 | Brand Guardian | customer-brand | Always (memory) | Consistency across all output |

### 🟡 P1 — Nice-to-Have (7 agents)

| # | Agent | Profile | Type | Why P1 |
|---|-------|---------|------|--------|
| 2 | Conflict Resolver | brain | On-demand | Edge case handling |
| 6 | Landing Page Builder | storeops | On-demand | Conversion optimization |
| 7 | SEO Optimizer | storeops | On-demand | Organic traffic |
| 9 | Social Media Manager | marketing | On-demand | Marketing automation |
| 10 | Content Creator | marketing | On-demand | Visual content |
| 11 | Promo Sender | marketing | On-demand | WhatsApp promotions |
| 12 | Engagement Responder | marketing | Cron 30m | Social presence |

---

## 8. Implementation Order

### Phase 1: Core (Hours 0-2)
1. ✅ **Request Router** — all requests flow through here
2. ✅ **Product Lister** — demo: "add a product by voice"
3. ✅ **Copywriter** — generates all descriptions

### Phase 2: Intelligence (Hours 2-4)
4. ✅ **Pricing Strategist** — demo: "competitor dropped price"
5. ✅ **Inventory Tracker** — cron running, stockout predictions
6. ✅ **Brand Guardian** — write brand guidelines to memory

### Phase 3: Operations (Hours 4-6)
7. ✅ **Support Agent** — cron running, auto-replies
8. ✅ **Demo Presenter** — polish all output for presentation
9. ✅ **SEO Optimizer** — meta tags for products

### Phase 4: Marketing (Hours 6-7)
10. ✅ **Content Creator** — product images
11. ✅ **Social Media Manager** — generate posts
12. ✅ **Promo Sender** — WhatsApp campaign

### Phase 5: Polish (Hours 7-8)
13. ✅ **Landing Page Builder** — product launch page
14. ✅ **Engagement Responder** — social monitoring
15. ✅ **Conflict Resolver** — edge case handling
16. 🎬 Demo rehearsal

---

*This document defines the event/profile-based agent architecture for HermesStore.*
*15 agents across 4 profiles: brain, storeops, marketing, customer-brand.*
*Last updated: July 11, 2026*
