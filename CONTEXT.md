# HermesStore — Command Code Context

> This document gives Command Code full context about the project.
> Read this before starting any task.

## What We're Building

**HermesStore** — An AI-powered ecommerce store manager that manages an entire Shopify store through a chat interface. Users type commands like "Add Nike Air Max at ₹8,999" and the AI agent creates the product, writes descriptions, sets pricing, manages inventory, handles support, and runs marketing campaigns.

**This is a hackathon demo** for the GrowthX Hermes Buildathon (July 12, Pune). Goal: working demo with real ₹9 sales in 8 hours.

## Architecture

```
Frontend (Next.js, port 3000)
    │
    │ fetch("http://localhost:8642/v1/chat/completions")
    │ (OpenAI-compatible API, SSE streaming)
    │
    ▼
Hermes API Server (built-in, port 8642)
    │
    ├── Agent brain (GPT-4o/GPT-5.5)
    ├── Shopify MCP (75 tools for store operations)
    ├── Skills (20 reusable procedures)
    ├── Cron jobs (8 scheduled monitoring agents)
    └── Memory (brand voice, pricing strategy)
```

**Key insight:** Hermes Agent has a BUILT-IN OpenAI-compatible API server. No custom backend needed. The frontend calls `http://localhost:8642/v1/chat/completions` directly.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js | 15.x |
| UI Components | shadcn/ui + Tailwind CSS | 4.x |
| State | Zustand | 5.x |
| AI Runtime | Hermes Agent | Latest |
| Store API | Shopify MCP Server | Latest |
| Database | Convex (real-time) | Latest |
| Hosting | Cloudflare Pages | — |
| Payments | Dodo Payments / Razorpay | — |

## Project Structure

```
C:\Users\satya\HermesStore\
│
├── frontend/                    ← NEXT.JS APP (we build this)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         ← Dashboard (home page)
│   │   │   ├── layout.tsx       ← Root layout with sidebar
│   │   │   ├── globals.css      ← Global styles
│   │   │   ├── products/
│   │   │   │   └── page.tsx     ← Product management
│   │   │   ├── marketing/
│   │   │   │   └── page.tsx     ← Marketing dashboard
│   │   │   ├── agents/
│   │   │   │   └── page.tsx     ← Agent management
│   │   │   └── api/             ← NO CUSTOM API ROUTES
│   │   ├── components/
│   │   │   ├── chat/            ← Chat interface
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageItem.tsx
│   │   │   │   └── ChatInput.tsx
│   │   │   ├── dashboard/       ← Dashboard widgets
│   │   │   │   ├── MetricCards.tsx
│   │   │   │   ├── AgentActivity.tsx
│   │   │   │   └── AlertsPanel.tsx
│   │   │   ├── products/        ← Product components
│   │   │   ├── marketing/       ← Marketing components
│   │   │   └── ui/              ← shadcn/ui components
│   │   └── lib/
│   │       ├── hermes-client.ts ← API client (talks to Hermes)
│   │       ├── types.ts         ← TypeScript types
│   │       └── utils.ts         ← Utilities
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.ts
│
├── skills/                      ← HERMES SKILLS (markdown files)
│   ├── product-listing.md
│   ├── pricing-strategy.md
│   ├── landing-page-builder.md
│   ├── support-agent.md
│   └── ... (20 total)
│
├── docs/                        ← ALL DOCUMENTATION
│   ├── ARCHITECTURE-EVENT.md
│   ├── ROADMAP-EVENT.md
│   ├── AGENTS-V1-EVENT.md
│   └── ...
│
└── .env.example                 ← Environment variables
```

## How the Frontend Connects to Hermes

**There is NO custom backend.** The frontend talks directly to Hermes's built-in API server.

```typescript
// src/lib/hermes-client.ts

const HERMES_URL = process.env.NEXT_PUBLIC_HERMES_URL || "http://localhost:8642";
const HERMES_KEY = process.env.NEXT_PUBLIC_HERMES_KEY || "";

// Chat with streaming
export async function chat(message: string, onToken: (token: string) => void) {
  const response = await fetch(`${HERMES_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HERMES_KEY}`,
    },
    body: JSON.stringify({
      model: "hermesstore",
      messages: [{ role: "user", content: message }],
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // Parse SSE: "data: {...}\n\n"
    const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.replace("data: ", "");
      if (data === "[DONE]") return;
      const parsed = JSON.parse(data);
      const token = parsed.choices?.[0]?.delta?.content;
      if (token) onToken(token);
    }
  }
}
```

## UI Reference (What We're Building)

The UI is inspired by these open-source projects (we take components, not the full app):

1. **agno-agi/agent-ui** (1796 stars) — Chat interface, sidebar, tool call visualization
   - GitHub: https://github.com/agno-agi/agent-ui
   - We take: ChatArea components, Sidebar, UI components, styling

2. **shadcn/ui** — Component library
   - We use: Button, Card, Dialog, Input, Select, Badge, etc.

## Pages We Build (6 total)

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Revenue, orders, agent activity, alerts |
| Products | `/products` | Product grid, add/edit products |
| Add Product | `/products/add` | Voice/image/text product creation |
| Marketing | `/marketing` | Social posts, campaigns, promo sender |
| Agents | `/agents` | Agent status, cron jobs, logs |
| Chat | Persistent sidebar | AI chat interface (always visible) |

## Design System

- **Theme:** Dark mode by default (shadcn dark)
- **Colors:** Zinc grays + blue accent
- **Font:** Inter or Geist
- **Components:** shadcn/ui base, customized
- **Responsive:** Mobile-first, but desktop-primary for demo

## What We're NOT Building (for hackathon)

- ❌ Custom backend / API routes
- ❌ User authentication (demo is single-user)
- ❌ Payment processing UI (payment link is external)
- ❌ Shipping/fulfillment UI (mocked as "coming soon")
- ❌ Finance/accounting UI (mocked as "coming soon")
- ❌ Real-time database sync (Convex is nice-to-have, not required)

## Hermes Profile Setup (for reference)

The Hermes agent runs as 4 separate profiles:

```bash
hermes profile create hermesstore-brain        # Port 8642 (orchestrator)
hermes profile create hermesstore-storeops     # Port 8643 (products, pricing)
hermes profile create hermesstore-marketing    # Port 8644 (social, content)
hermes profile create hermesstore-customer-brand # Port 8645 (support, copy)
```

Each profile has its own skills, cron jobs, and MCP config.
The frontend connects ONLY to the brain (port 8642).

## Important Notes

1. **No custom backend code.** Hermes has a built-in API server. Frontend calls it directly.
2. **Chat is the core UX.** Everything happens through natural language in the chat sidebar.
3. **Approval flow.** Destructive actions (price changes, publishing) require user approval via the API.
4. **Skills are markdown files.** They define how agents behave. Located in `skills/` directory.
5. **Cron jobs are managed via API.** `GET/POST http://localhost:8642/api/jobs`
6. **This is a demo.** Polish matters. Make it look production-quality even if features are limited.
