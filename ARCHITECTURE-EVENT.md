# HermesStore — EVENT Architecture

> AI-powered ecommerce store manager built on Hermes Agent  
> GrowthX Hermes Buildathon · **Simplified Multi-Profile Architecture**  
> Target: ₹9 sale on a live Shopify store

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Multi-Profile Architecture](#2-multi-profile-architecture)
3. [Profile Configurations](#3-profile-configurations)
4. [Agent Roster (15 Agents)](#4-agent-roster-15-agents)
5. [Routing & Data Flow](#5-routing--data-flow)
6. [Frontend (Thin Client)](#6-frontend-thin-client)
7. [Department Details](#7-department-details)
8. [Mocked Departments (Coming Soon)](#8-mocked-departments-coming-soon)
9. [Deployment & Ports](#9-deployment--ports)
10. [Hackathon Checklist](#10-hackathon-checklist)

---

## 1. System Overview

> **Key insight:** Instead of one monolithic Hermes profile, we run **4 specialized Hermes profiles** — one brain + three departments. Each profile is an independent Hermes instance with its own skills, MCP servers, cron jobs, and memory. The **brain** routes user requests to the right department via HTTP calls to each department's API server port.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         HERMESSTORE EVENT ARCHITECTURE                           │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                   FRONTEND — THIN CLIENT (Next.js 16)                      │  │
│  │                                                                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │  │
│  │  │Dashboard │ │ Products │ │  Orders  │ │Marketing │ │  Support     │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │  │
│  │  ┌──────────┐ ┌──────────────────────────────────────────────────────────┐│  │
│  │  │ Chat UI  │ │              "Coming Soon" Cards                         ││  │
│  │  │(agent-ui)│ │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   ││  │
│  │  └──────────┘  │ │ Fulfillment│ │  Finance   │ │    Analytics       │   ││  │
│  │                │ │  (mocked)  │ │  (mocked)  │ │    (mocked)        │   ││  │
│  │                │ └────────────┘ └────────────┘ └────────────────────┘   ││  │
│  │                └──────────────────────────────────────────────────────────┘│  │
│  │                                                                            │  │
│  │  NO API routes. NO backend code. Just React components + fetch calls.      │  │
│  └─────────────────────────────────┬──────────────────────────────────────────┘  │
│                                    │                                             │
│                         HTTP (SSE streaming)                                     │
│                     fetch('http://localhost:8642/v1/chat/completions')            │
│                                    │                                             │
│  ┌─────────────────────────────────┴──────────────────────────────────────────┐  │
│  │              BRAIN PROFILE — Hermes API Server (Port 8642)                  │  │
│  │              Main router. Routes to departments by intent.                  │  │
│  │                                                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │  │
│  │  │  ROUTING LOGIC                                                      │    │  │
│  │  │  User: "Update product price"  → http://localhost:8643 (Store Ops)  │    │  │
│  │  │  User: "Create Instagram post" → http://localhost:8644 (Marketing)  │    │  │
│  │  │  User: "Reply to customer"     → http://localhost:8645 (Cust/Brand) │    │  │
│  │  │  User: "Where's my order?"     → http://localhost:8645 (Cust/Brand) │    │  │
│  │  │  User: "General question"      → Brain handles directly             │    │  │
│  │  └─────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                             │  │
│  │  Agents: 3 (router, orchestrator, fallback)                                │  │
│  └─────┬──────────────────┬──────────────────┬────────────────────────────────┘  │
│        │                  │                  │                                    │
│        ▼                  ▼                  ▼                                    │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                            │
│  │  STORE OPS  │   │  MARKETING  │   │  CUST/BRAND │                            │
│  │  Port 8643  │   │  Port 8644  │   │  Port 8645  │                            │
│  │             │   │             │   │             │                            │
│  │  5 agents   │   │  4 agents   │   │  3 agents   │                            │
│  │  Skills:    │   │  Skills:    │   │  Skills:    │                            │
│  │  - product  │   │  - campaign │   │  - support  │                            │
│  │  - order    │   │  - social   │   │  - brand    │                            │
│  │  - inventory│   │  - email    │   │  - feedback │                            │
│  │  - pricing  │   │  - SEO      │   │             │                            │
│  │             │   │             │   │             │                            │
│  │  MCP:       │   │  MCP:       │   │  MCP:       │                            │
│  │  - shopify  │   │  - shopify  │   │  - shopify  │                            │
│  │  - memory   │   │  - memory   │   │  - memory   │                            │
│  └─────────────┘   └─────────────┘   └─────────────┘                            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        EXTERNAL SERVICES                                    │ │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────────────┐          │ │
│  │  │  Shopify  │ │  OpenAI   │ │ AgentMemory│ │   Dodo Payments   │          │ │
│  │  │  Store    │ │  (model)  │ │ (memory)  │ │   (₹9 sale)       │          │ │
│  │  └───────────┘ └───────────┘ └───────────┘ └────────────────────┘          │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Why Multi-Profile?

| Aspect | Single Profile (Original) | Multi-Profile (Event) |
|--------|--------------------------|----------------------|
| Isolation | One agent does everything | Each department is independent |
| Skills | 7 skills, 1 agent | 15 agents, focused skills |
| Scalability | Bottleneck on one process | Scale departments independently |
| Demo value | "One smart bot" | "AI team with 15 agents" |
| Failure blast radius | One failure = everything down | One dept down, others still work |

---

## 2. Multi-Profile Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    4 HERMES PROFILES                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  BRAIN (Port 8642)                                           │    │
│  │  Role: Router + Orchestrator                                 │    │
│  │  Profile: ~/.hermes/profiles/brain/                          │    │
│  │  Agents: 3                                                   │    │
│  │  Skills: routing, orchestration, fallback                    │    │
│  │  MCP: agentmemory (shared context)                           │    │
│  └────────────────────────────────┬─────────────────────────────┘    │
│                                   │                                  │
│              ┌────────────────────┼────────────────────┐             │
│              │                    │                    │             │
│              ▼                    ▼                    ▼             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │
│  │  STORE OPS        │ │  MARKETING        │ │  CUSTOMER/BRAND   │  │
│  │  (Port 8643)      │ │  (Port 8644)      │ │  (Port 8645)      │  │
│  │                   │ │                   │ │                   │  │
│  │  Profile:         │ │  Profile:         │ │  Profile:         │  │
│  │  ~/.hermes/       │ │  ~/.hermes/       │ │  ~/.hermes/       │  │
│  │  profiles/        │ │  profiles/        │ │  profiles/        │  │
│  │  storeops/        │ │  marketing/       │ │  customer-brand/  │  │
│  │                   │ │                   │ │                   │  │
│  │  Agents: 5        │ │  Agents: 4        │ │  Agents: 3        │  │
│  │  Priority: ★★★    │ │  Priority: ★★     │ │  Priority: ★      │  │
│  │                   │ │                   │ │                   │  │
│  │  Skills:          │ │  Skills:          │ │  Skills:          │  │
│  │  - product-mgmt   │ │  - campaign-mgmt  │ │  - customer-sup   │  │
│  │  - order-proc     │ │  - social-media   │ │  - brand-voice    │  │
│  │  - inventory-mgmt │ │  - email-mktg     │ │  - feedback-col   │  │
│  │  - pricing-opt    │ │  - seo-opt        │ │                   │  │
│  │                   │ │                   │ │                   │  │
│  │  MCP:             │ │  MCP:             │ │  MCP:             │  │
│  │  - shopify (75)   │ │  - shopify (75)   │ │  - shopify (75)   │  │
│  │  - agentmemory    │ │  - agentmemory    │ │  - agentmemory    │  │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘  │
│                                                                      │
│  Priority: Store Ops > Marketing > Customer/Brand                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Inter-Profile Communication

```
Brain (8642)
    │
    │ POST http://localhost:{port}/v1/chat/completions
    │
    ├──► Store Ops (8643)    — product/order/inventory queries
    ├──► Marketing (8644)    — campaign/social/email queries  
    └──► Customer/Brand (8645) — support/brand/feedback queries
```

Each department profile exposes its own OpenAI-compatible API server. The brain forwards the user's message (with context) to the appropriate department's `/v1/chat/completions` endpoint, then streams the response back to the frontend.

---

## 3. Profile Configurations

### 3.1 Brain Profile

```yaml
# ~/.hermes/profiles/brain/config.yaml
model: openai/gpt-4o
providers:
  openai:
    api_key: ${OPENAI_API_KEY}

api_server:
  enabled: true
  port: 8642
  key: ${BRAIN_API_KEY}

mcp:
  servers:
    agentmemory:
      command: npx
      args: ["-y", "agentmemory-mcp-server"]
      env:
        AGENTMEMORY_API_KEY: ${AGENTMEMORY_API_KEY}

# Brain's system prompt: route to departments
system_prompt: |
  You are the Brain of HermesStore. You route user requests to the right department:
  - Product, order, inventory, pricing → forward to Store Ops (http://localhost:8643)
  - Marketing, campaigns, social, email, SEO → forward to Marketing (http://localhost:8644)
  - Customer support, brand, feedback → forward to Customer/Brand (http://localhost:8645)
  - General questions → answer directly
  
  When forwarding, include relevant context from the conversation.
  Always respond in the user's language. Be concise.
```

### 3.2 Store Operations Profile

```yaml
# ~/.hermes/profiles/storeops/config.yaml
model: openai/gpt-4o
providers:
  openai:
    api_key: ${OPENAI_API_KEY}

api_server:
  enabled: true
  port: 8643
  key: ${STOREOPS_API_KEY}

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
```

### 3.3 Marketing Profile

```yaml
# ~/.hermes/profiles/marketing/config.yaml
model: openai/gpt-4o
providers:
  openai:
    api_key: ${OPENAI_API_KEY}

api_server:
  enabled: true
  port: 8644
  key: ${MARKETING_API_KEY}

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
```

### 3.4 Customer/Brand Profile

```yaml
# ~/.hermes/profiles/customer-brand/config.yaml
model: openai/gpt-4o
providers:
  openai:
    api_key: ${OPENAI_API_KEY}

api_server:
  enabled: true
  port: 8645
  key: ${CUSTOMER_BRAND_API_KEY}

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
```

---

## 4. Agent Roster (15 Agents)

### Total: 15 agents across 4 profiles

```
┌──────────────────────────────────────────────────────────────────┐
│                    AGENT ROSTER (15 TOTAL)                        │
│                                                                   │
│  BRAIN (3 agents)                    Port 8642                    │
│  ├── router          Intent classification, dept routing          │
│  ├── orchestrator    Multi-dept coordination                      │
│  └── fallback        General Q&A, no-dept queries                 │
│                                                                   │
│  STORE OPERATIONS (5 agents)         Port 8643  ★★★ Priority     │
│  ├── product-mgr     CRUD products, images, descriptions          │
│  ├── order-mgr       Process orders, fulfillment, tracking        │
│  ├── inventory-mgr   Stock levels, reorder, alerts                │
│  ├── pricing-mgr     Pricing strategy, discounts, ₹9 sale         │
│  └── analytics-mgr   Sales reports, trends (simplified)           │
│                                                                   │
│  MARKETING (4 agents)                Port 8644  ★★ Priority       │
│  ├── campaign-mgr    Create/manage campaigns                      │
│  ├── social-mgr      Instagram, Facebook, WhatsApp posts          │
│  ├── email-mgr       Email campaigns, abandoned cart              │
│  └── seo-mgr         Product SEO, meta tags, keywords             │
│                                                                   │
│  CUSTOMER/BRAND (3 agents)           Port 8645  ★ Priority        │
│  ├── support-mgr     Customer queries, order status               │
│  ├── brand-mgr       Brand voice, messaging consistency           │
│  └── feedback-mgr    Reviews, ratings, customer feedback          │
└──────────────────────────────────────────────────────────────────┘
```

### Agent Details

| # | Profile | Agent | Role | Key Skills |
|---|---------|-------|------|------------|
| 1 | brain | router | Classify user intent, select department | Intent detection, dept selection |
| 2 | brain | orchestrator | Coordinate multi-dept tasks | Cross-dept orchestration |
| 3 | brain | fallback | Handle general queries | General knowledge |
| 4 | storeops | product-mgr | Product CRUD operations | Create, update, delete products |
| 5 | storeops | order-mgr | Order processing | Fulfill, track, refund orders |
| 6 | storeops | inventory-mgr | Inventory management | Stock levels, reorder alerts |
| 7 | storeops | pricing-mgr | Pricing & discounts | Price optimization, ₹9 sale setup |
| 8 | storeops | analytics-mgr | Sales analytics | Revenue reports, trends |
| 9 | marketing | campaign-mgr | Campaign creation | Diwali sale, flash sales |
| 10 | marketing | social-mgr | Social media | Instagram, FB posts |
| 11 | marketing | email-mgr | Email marketing | Newsletters, cart recovery |
| 12 | marketing | seo-mgr | SEO optimization | Meta tags, keywords |
| 13 | customer-brand | support-mgr | Customer support | Query resolution, order status |
| 14 | customer-brand | brand-mgr | Brand management | Voice consistency, messaging |
| 15 | customer-brand | feedback-mgr | Feedback collection | Reviews, ratings |

---

## 5. Routing & Data Flow

### Brain Routing Table

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ROUTING TABLE                                     │
│                                                                          │
│  User Intent              → Department         Port   Profile            │
│  ─────────────────────────────────────────────────────────────────────  │
│  "Update product"         → Store Operations   8643   storeops           │
│  "Process order"          → Store Operations   8643   storeops           │
│  "Check inventory"        → Store Operations   8643   storeops           │
│  "Set ₹9 price"           → Store Operations   8643   storeops           │
│  "Sales report"           → Store Operations   8643   storeops           │
│  ─────────────────────────────────────────────────────────────────────  │
│  "Create campaign"        → Marketing          8644   marketing          │
│  "Instagram post"         → Marketing          8644   marketing          │
│  "Send email blast"       → Marketing          8644   marketing          │
│  "Fix SEO"                → Marketing          8644   marketing          │
│  ─────────────────────────────────────────────────────────────────────  │
│  "Customer complaint"     → Customer/Brand     8645   customer-brand     │
│  "Where's my order?"      → Customer/Brand     8645   customer-brand     │
│  "Check reviews"          → Customer/Brand     8645   customer-brand     │
│  ─────────────────────────────────────────────────────────────────────  │
│  "What is HermesStore?"   → Brain (direct)     8642   brain              │
│  "Help me get started"    → Brain (direct)     8642   brain              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request Flow (End-to-End)

```
┌──────────┐                                                    ┌──────────┐
│  User    │                                                    │  Shopify │
│  Browser │                                                    │  Store   │
└────┬─────┘                                                    └────▲─────┘
     │                                                               │
     │  1. POST /v1/chat/completions                                 │
     │  { "messages": [{"role":"user",                               │
     │      "content":"Set product X to ₹9"}] }                      │
     ▼                                                               │
┌────────────────────┐                                               │
│  BRAIN (Port 8642) │                                               │
│                    │                                               │
│  2. router agent   │                                               │
│  Classifies intent │                                               │
│  → "store_ops"     │                                               │
│                    │                                               │
│  3. Forward to     │                                               │
│  Store Ops         │                                               │
│  └────────────────►│                                               │
└────────────────────┘                                               │
     │                                                               │
     ▼                                                               │
┌────────────────────┐                                               │
│  STORE OPS (8643)  │                                               │
│                    │                                               │
│  4. pricing-mgr    │                                               │
│  agent processes   │                                               │
│  the request       │                                               │
│                    │                                               │
│  5. Calls Shopify  │                                               │
│  MCP to update     │──────────────────────────────────────────────►│
│  product price     │                                               │
│                    │◄──────────────────────────────────────────────│
│  6. Returns result │         Price updated ✓                       │
│  to Brain          │                                               │
│  └────────────────►│                                               │
└────────────────────┘                                               │
     │                                                               │
     ▼                                                               │
┌────────────────────┐                                               │
│  BRAIN (Port 8642) │                                               │
│                    │                                               │
│  7. Streams result │                                               │
│  back to frontend  │                                               │
│  └────────────────►│                                               │
└────────────────────┘                                               │
     │                                                               │
     ▼                                                               │
┌──────────┐                                                         │
│  User    │  "Product X updated to ₹9. Live on store now! 🎉"      │
│  Browser │                                                         │
└──────────┘                                                         │
```

### Brain Router Skill (Pseudocode)

```python
# Skills in ~/.hermes/profiles/brain/skills/router/SKILL.md
# The router agent uses this skill to classify intent and forward

DEPARTMENT_MAP = {
    "store_ops": {
        "keywords": ["product", "order", "inventory", "price", "stock", "sales", "revenue"],
        "port": 8643,
        "url": "http://localhost:8643/v1/chat/completions"
    },
    "marketing": {
        "keywords": ["campaign", "social", "instagram", "email", "seo", "marketing", "post"],
        "port": 8644,
        "url": "http://localhost:8644/v1/chat/completions"
    },
    "customer_brand": {
        "keywords": ["customer", "support", "complaint", "review", "feedback", "brand", "order status"],
        "port": 8645,
        "url": "http://localhost:8645/v1/chat/completions"
    }
}

async def route(user_message: str, context: dict):
    # 1. Classify intent using LLM
    intent = await classify_intent(user_message)
    
    # 2. Select department
    dept = DEPARTMENT_MAP[intent.department]
    
    # 3. Forward to department's API server
    response = await fetch(dept["url"], {
        "messages": [
            {"role": "system", "content": f"Context: {context}"},
            {"role": "user", "content": user_message}
        ],
        "stream": True
    })
    
    # 4. Stream response back to frontend
    return response
```

---

## 6. Frontend (Thin Client)

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | App Router, RSC for layout/static |
| React | 19 | Concurrent features, Server Actions |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | latest | Accessible component primitives |
| TypeScript | 5.x | Type safety |

### Frontend API Client

```typescript
// lib/hermes-client.ts — Connects to Brain on port 8642

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'http://localhost:8642';
const BRAIN_KEY = process.env.NEXT_PUBLIC_BRAIN_API_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${BRAIN_KEY}`,
};

// All chat goes through Brain (port 8642)
// Brain routes to the right department automatically
export async function chatStream(message: string, sessionId?: string) {
  const res = await fetch(`${BRAIN_URL}/v1/chat/completions`, {
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

// Direct department access (for dashboard widgets that need specific dept data)
export async function queryDepartment(
  dept: 'storeops' | 'marketing' | 'customer-brand',
  message: string
) {
  const ports = { storeops: 8643, marketing: 8644, 'customer-brand': 8645 };
  const res = await fetch(`http://localhost:${ports[dept]}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'hermes',
      messages: [{ role: 'user', content: message }],
      stream: true,
    }),
  });
  return res.body;
}
```

### Pages

```
/                          → Dashboard (KPIs, recent activity, dept status)
/agents                    → 15-agent roster with status indicators
/chat                      → Full-screen chat (routes through Brain)
/products                  → Product catalog (Store Ops data)
/orders                    → Order list (Store Ops data)
/marketing                 → Campaign manager (Marketing data)
/support                   → Customer support (Customer/Brand data)
/coming-soon               → Mocked departments showcase
```

### "Coming Soon" Department Cards

```tsx
// components/ComingSoonCard.tsx
export function ComingSoonCard({ 
  department, 
  icon, 
  description, 
  plannedAgents 
}: {
  department: string;
  icon: string;
  description: string;
  plannedAgents: string[];
}) {
  return (
    <Card className="opacity-60 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <CardTitle>{department}</CardTitle>
          <Badge variant="outline">Coming Soon</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Planned Agents:</p>
        <ul className="space-y-1">
          {plannedAgents.map(agent => (
            <li key={agent} className="text-sm">• {agent}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Usage in dashboard
<ComingSoonCard
  department="Fulfillment"
  icon="📦"
  description="Warehouse management, shipping logistics, delivery tracking"
  plannedAgents={['warehouse-mgr', 'shipping-mgr', 'tracking-mgr']}
/>
<ComingSoonCard
  department="Finance"
  icon="💰"
  description="Invoicing, payments, financial reporting, tax compliance"
  plannedAgents={['invoice-mgr', 'payment-mgr', 'report-mgr']}
/>
<ComingSoonCard
  department="Analytics"
  icon="📊"
  description="Advanced analytics, predictive models, business intelligence"
  plannedAgents={['data-analyst', 'forecast-mgr', 'insight-mgr']}
/>
```

---

## 7. Department Details

### 7.1 Store Operations (Port 8643) — ★★★ Priority

**The core department. Handles all Shopify store operations.**

#### Skills

```
~/.hermes/profiles/storeops/skills/
├── product-management/
│   └── SKILL.md      # Create, update, delete products; manage images, descriptions
├── order-processing/
│   └── SKILL.md      # Process orders, fulfill, track, handle refunds
├── inventory-management/
│   └── SKILL.md      # Stock levels, reorder alerts, supplier communication
├── pricing-optimization/
│   └── SKILL.md      # Dynamic pricing, discounts, ₹9 sale setup
└── sales-analytics/
    └── SKILL.md      # Revenue reports, sales trends, top products
```

#### Cron Jobs

| Job | Schedule | Agent | Description |
|-----|----------|-------|-------------|
| `order-sync` | Every 5 min | order-mgr | Sync new orders from Shopify |
| `inventory-check` | Every 15 min | inventory-mgr | Check low stock, send alerts |
| `price-monitor` | Every hour | pricing-mgr | Monitor competitor prices |
| `daily-sales` | 8:00 AM IST | analytics-mgr | Yesterday's sales summary |

#### MCP Tools Used

- Shopify: `create_product`, `update_product`, `list_products`, `list_orders`, `fulfill_order`, `get_inventory_levels`, `adjust_inventory`, `create_discount`

### 7.2 Marketing (Port 8644) — ★★ Priority

**Handles all marketing, social media, and email campaigns.**

#### Skills

```
~/.hermes/profiles/marketing/skills/
├── campaign-management/
│   └── SKILL.md      # Create campaigns (Diwali, flash sales, ₹9 special)
├── social-media/
│   └── SKILL.md      # Instagram/FB/WhatsApp posts, scheduling
├── email-marketing/
│   └── SKILL.md      # Newsletters, abandoned cart emails, promotions
└── seo-optimization/
    └── SKILL.md      # Product SEO, meta tags, keywords, descriptions
```

#### Cron Jobs

| Job | Schedule | Agent | Description |
|-----|----------|-------|-------------|
| `social-queue` | 10:00 AM IST | social-mgr | Post scheduled social content |
| `email-campaign` | 11:00 AM IST | email-mgr | Send queued email campaigns |
| `seo-audit` | Weekly Monday | seo-mgr | Audit product SEO scores |

#### MCP Tools Used

- Shopify: `get_sales_data`, `get_traffic_data`, `get_conversion_rate`, `list_products` (for SEO)

### 7.3 Customer/Brand (Port 8645) — ★ Priority

**Handles customer support, brand voice, and feedback collection.**

#### Skills

```
~/.hermes/profiles/customer-brand/skills/
├── customer-support/
│   └── SKILL.md      # Auto-reply to queries, order status, FAQ management
├── brand-voice/
│   └── SKILL.md      # Consistent brand messaging, tone guidelines
└── feedback-management/
    └── SKILL.md      # Review collection, rating analysis, sentiment
```

#### Cron Jobs

| Job | Schedule | Agent | Description |
|-----|----------|-------|-------------|
| `support-queue` | Every 10 min | support-mgr | Process pending support tickets |
| `review-check` | Daily 9:00 AM | feedback-mgr | Check new reviews, alert on negative |

#### MCP Tools Used

- Shopify: `list_customers`, `get_customer`, `list_orders`, `get_order`

---

## 8. Mocked Departments (Coming Soon)

These departments are shown as "Coming Soon" cards in the UI. They demonstrate the vision without requiring implementation.

### Fulfillment (Future Port 8646)

```
Planned Agents: warehouse-mgr, shipping-mgr, tracking-mgr
Planned Skills: warehouse-management, shipping-logic, delivery-tracking
Planned MCP: Shiprocket MCP, Delhivery MCP
```

### Finance (Future Port 8647)

```
Planned Agents: invoice-mgr, payment-mgr, report-mgr
Planned Skills: invoicing, payment-processing, financial-reporting
Planned MCP: Razorpay MCP, Tally MCP
```

### Analytics (Future Port 8648)

```
Planned Agents: data-analyst, forecast-mgr, insight-mgr
Planned Skills: data-analysis, demand-forecasting, business-intelligence
Planned MCP: Google Analytics MCP, custom analytics
```

---

## 9. Deployment & Ports

### Port Allocation

```
┌────────────────────────────────────────────────────────────┐
│                    PORT ALLOCATION                          │
│                                                            │
│  Port   Profile            Status      Agents              │
│  ─────  ─────────────────  ──────────  ──────────────────  │
│  8642   brain              ✅ Active    3 (router+orch+fb)  │
│  8643   storeops           ✅ Active    5                   │
│  8644   marketing          ✅ Active    4                   │
│  8645   customer-brand     ✅ Active    3                   │
│  8646   fulfillment        🔒 Planned   3 (mocked)          │
│  8647   finance            🔒 Planned   3 (mocked)          │
│  8648   analytics          🔒 Planned   3 (mocked)          │
│                                                            │
│  Total Active: 15 agents across 4 profiles                 │
│  Total Planned: 9 agents across 3 profiles (mocked)        │
└────────────────────────────────────────────────────────────┘
```

### Startup Script

```bash
#!/bin/bash
# start-hermesstore.sh — Start all 4 Hermes profiles

echo "Starting HermesStore (4 profiles, 15 agents)..."

# Start Brain (Port 8642)
hermes -p brain gateway &
echo "Brain started on port 8642"

# Start Store Operations (Port 8643)
hermes -p storeops gateway &
echo "Store Ops started on port 8643"

# Start Marketing (Port 8644)
hermes -p marketing gateway &
echo "Marketing started on port 8644"

# Start Customer/Brand (Port 8645)
hermes -p customer-brand gateway &
echo "Customer/Brand started on port 8645"

echo "All 4 profiles running. Frontend connects to Brain on :8642"
```

### Environment Variables

```bash
# .env (shared across all profiles)
OPENAI_API_KEY=sk-...

# Brain
BRAIN_API_KEY=<32-char-hex>
BRAIN_PORT=8642

# Store Operations
STOREOPS_API_KEY=<32-char-hex>
STOREOPS_PORT=8643

# Marketing
MARKETING_API_KEY=<32-char-hex>
MARKETING_PORT=8644

# Customer/Brand
CUSTOMER_BRAND_API_KEY=<32-char-hex>
CUSTOMER_BRAND_PORT=8645

# Shared
SHOPIFY_ACCESS_TOKEN=shpat_...
SHOPIFY_STORE_URL=your-store.myshopify.com
AGENTMEMORY_API_KEY=am_...

# Frontend
NEXT_PUBLIC_BRAIN_URL=http://localhost:8642
NEXT_PUBLIC_BRAIN_API_KEY=<same as BRAIN_API_KEY>
```

---

## 10. Hackathon Checklist

### Must-Have for Demo

- [ ] 4 Hermes profiles running (brain, storeops, marketing, customer-brand)
- [ ] 15 agents initialized and responding
- [ ] Brain routing works (test each department)
- [ ] Shopify MCP connected (at least read operations)
- [ ] Frontend connected to Brain on port 8642
- [ ] Chat UI working (SSE streaming)
- [ ] ₹9 product created and visible on store
- [ ] At least one order processed through the system

### Nice-to-Have

- [ ] Agent memory working (AgentMemory MCP)
- [ ] Cron jobs running (order-sync, inventory-check)
- [ ] "Coming Soon" cards displayed
- [ ] Agent status dashboard
- [ ] Voice input (Wispr Flow)

### Demo Script

```
1. "Hi, I'm Satya. Show me my store dashboard."
   → Brain routes to Store Ops → Shows KPIs

2. "Create a ₹9 product called 'HermesStore Magic'"
   → Brain routes to Store Ops → product-mgr creates product

3. "Now create an Instagram post for it"
   → Brain routes to Marketing → social-mgr drafts post

4. "A customer is asking about delivery time"
   → Brain routes to Customer/Brand → support-mgr suggests reply

5. "Process the test order"
   → Brain routes to Store Ops → order-mgr fulfills order

6. "Show me the coming soon departments"
   → Display mocked Fulfillment, Finance, Analytics cards
```

---

## Appendix: Key Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Architecture** | **4-profile multi-agent** | Better demo value, department isolation |
| **Profile count** | 4 active + 3 mocked | Manageable for hackathon, extensible |
| **Agent count** | 15 | Enough for demo, not overwhelming |
| **Brain pattern** | Router + forwarder | Clean separation, easy to extend |
| **Frontend** | Thin client → Brain only | Single entry point, simple |
| **Database** | AgentMemory (shared) | Lightweight, no Convex setup needed |
| **AI model** | GPT-4o | Fast, reliable, cost-effective |
| **Commerce** | Shopify MCP (75 tools) | Official, well-maintained |
| **Priority** | Store Ops > Marketing > C&B | Core ops first, marketing second |
| **Goal** | ₹9 sale | Real transaction proves system works |
