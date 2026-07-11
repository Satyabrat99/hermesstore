# HermesStore — Hackathon Site Map

> **Pages we actually build** for the 8-hour hackathon demo. Simplified from the full 15-page plan.
> **Last updated**: 2026-07-11

---

## Hackathon Pages (Build These)

```
/
├── /dashboard ──────────────────── Default landing page ⭐ PRIMARY DEMO
│   ├── Metric cards (revenue, orders, conversion, visitors)
│   ├── Agent activity feed
│   ├── Alerts panel (competitor price drop, escalated ticket)
│   └── Quick actions
│
├── /products ───────────────────── Product catalog
│   ├── Product grid with search/filter
│   └── /products/add ──────────── Add product wizard ⭐ PRIMARY DEMO
│       ├── Voice input (Web Speech API)
│       ├── Image upload (vision model)
│       └── Text input
│
├── /marketing ──────────────────── Marketing hub ⭐ PRIMARY DEMO
│   ├── Campaign overview
│   └── /marketing/social ──────── Social media manager
│       ├── Content calendar
│       └── Post previews (Instagram carousel)
│
├── /agents ─────────────────────── Agent management
│   ├── Agent list with status (6 agents)
│   └── Agent detail + logs
│
└── /chat ───────────────────────── Persistent AI chat sidebar ⭐ PRIMARY DEMO
    ├── Natural language commands
    ├── Agent responses
    └── Approval cards (HITL flow)
```

**Build count: 6 pages** (vs. 15 in full plan)

---

## Page Details

### `/dashboard` — Default Landing Page

**Purpose:** Morning briefing and command center. First thing the user sees.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Metric Cards** (4) | Revenue, Orders, Conversion, Visitors. Sparklines + % change. |
| **Agent Activity Feed** | Chronological log of agent actions overnight. |
| **Alerts Panel** | 2-3 staged alerts: competitor price drop, escalated ticket, trending product. |
| **Quick Actions** | "Add Product", "Create Campaign", "Chat with Agent". |

**Demo Status:** 🟢 **Real** — Core demo flow starts here. Must look polished.
- Metric cards: Mock data seeded for demo store
- Agent feed: Pre-populated with realistic overnight actions
- Alerts: 2-3 staged alerts for demo triggers

---

### `/products` — Product Catalog

**Purpose:** Browse and manage products.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Product Grid** | Card layout with image, title, price, stock status. |
| **Search & Filter** | Full-text search. Filters: category, price range. |
| **"Add Product" CTA** | Opens wizard. |

**Demo Status:** 🟢 **Real** — Products from demo store (pre-seeded 10-15 items).

---

### `/products/add` — Add Product Wizard ⭐ HERO FEATURE

**Purpose:** Multi-modal product creation. The showstopper demo.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Input Method Selector** | 3 options: Voice, Image, Text |
| **Voice Recorder** | Microphone button. Transcription in real-time. |
| **Image Upload** | Drag-drop. Agent extracts product info from image. |
| **Text Input** | Freeform text → agent parses structured product. |
| **AI Generation Preview** | Shows generated: title, description, price, tags, SEO score. |
| **Approval Flow** | Preview → Edit/Regenerate → Publish. |

**Demo Status:** 🟢 **Real** — This is THE primary demo flow.
- Voice: Browser Web Speech API + Whisper fallback
- Image: Vision model for product extraction
- Text: LLM parsing with structured output

---

### `/marketing` — Campaign Overview

**Purpose:** All campaigns at a glance.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Campaign Cards** | Name, status, channels, dates, metrics. |
| **Create Campaign CTA** | Natural language → agent plans & generates. |

**Demo Status:** 🟢 **Real** — Campaign creation flow must work.

---

### `/marketing/social` — Social Media Manager

**Purpose:** Create and schedule social posts.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Content Calendar** | Monthly view of scheduled posts. |
| **Post Previews** | See how posts look on Instagram. |
| **Carousel Generator** | skill-autoecom integration. |

**Demo Status:** 🟡 **Partial** — Calendar + preview real. Posting may be mocked.

---

### `/agents` — Agent Management

**Purpose:** Monitor the 6 AI agents.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Agent List** | Cards for each agent: name, status, actions today. |
| **Status Indicators** | Green (healthy), yellow (warning), red (error). |

**Demo Status:** 🟢 **Real** — Must show 6 agents with realistic status.

**The 6 Agents:**
| # | Agent | Status |
|---|-------|--------|
| 1 | 🏪 Store Builder Agent | Configured ✓ |
| 2 | 📦 Product Curator Agent | Active (12 products managed) |
| 3 | 💰 Dynamic Pricing Agent | Active (3 price changes today) |
| 4 | 📣 Marketing Agent | Active (1 campaign running) |
| 5 | 🔍 Competitor Monitor Agent | Active (last scan: 2h ago) |
| 6 | 🤝 Customer Support Agent | Active (5 tickets processed) |

---

### `/chat` — Persistent AI Chat Sidebar

**Purpose:** Natural language interface to all agents.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Chat Interface** | Streaming messages, input box. (From agent-ui) |
| **Approval Cards** | HITL approval/rejection for agent actions. |
| **Session List** | Sidebar with conversation history. |

**Demo Status:** 🟢 **Real** — Core interaction model. Must stream responses smoothly.

---

## Pages NOT Built for Hackathon

| Page | Reason |
|------|--------|
| `/orders` | Not in demo flow — pre-seeded data only |
| `/orders/[id]` | Detail page not needed |
| `/orders/fulfillment` | Post-event feature |
| `/marketing/email` | Mock for now — focus on social |
| `/marketing/ads` | Post-event feature |
| `/marketing/content` | Content library not critical for demo |
| `/competitors` | Pricing agent handles this via chat |
| `/support` | Customer support via chat, not separate page |
| `/support/[id]` | Ticket detail not needed |
| `/support/policies` | Post-event feature |
| `/analytics` | Charts exist but not primary demo flow |
| `/agents/[id]` | Agent detail secondary |
| `/settings` | Pre-configured for demo |

---

## Demo Flow (Recommended Order)

1. **Dashboard** → Show overnight activity, alerts, metrics
2. **Chat** → "Add a new product: blue cotton t-shirt, $29.99, sizes S-XL"
3. **Products** → Show the AI-generated listing
4. **Chat** → "Create a summer sale campaign, 20% off all apparel"
5. **Marketing** → Show generated social posts with carousel
6. **Dashboard** → Show updated metrics, agent activity
7. **Chat** → Walk through a support ticket approval (HITL)

**Total demo time: ~8-10 minutes**
