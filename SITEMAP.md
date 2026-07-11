# HermesStore — Site Map

> Complete page structure for the HermesStore AI-managed e-commerce platform.
> Each page includes: purpose, key components, data sources, and mock/real status for hackathon demo.

---

## Full Site Map

```
/
├── /dashboard ──────────────────── Default landing page
│   ├── Metric cards (revenue, orders, conversion, visitors)
│   ├── Agent activity feed
│   ├── Alerts panel
│   └── Quick actions
│
├── /products ───────────────────── Product catalog
│   ├── Product grid with search/filter
│   ├── /products/add ──────────── Add product wizard
│   ├── /products/[id] ─────────── Product detail
│   └── /products/bulk ─────────── Bulk import
│
├── /orders ─────────────────────── Order management
│   ├── Order list with status filters
│   ├── /orders/[id] ───────────── Order detail
│   └── /orders/fulfillment ────── Fulfillment queue
│
├── /marketing ──────────────────── Marketing hub
│   ├── Campaign overview
│   ├── /marketing/social ──────── Social media manager
│   ├── /marketing/email ───────── Email campaigns
│   ├── /marketing/ads ─────────── Ad campaigns
│   └── /marketing/content ─────── Content library
│
├── /competitors ────────────────── Competitive intelligence
│   ├── Competitor list
│   ├── Price comparison table
│   └── Alerts history
│
├── /support ────────────────────── Customer support
│   ├── Ticket queue
│   ├── /support/[id] ──────────── Ticket detail
│   └── /support/policies ──────── Store policies
│
├── /analytics ──────────────────── Business intelligence
│   ├── Revenue dashboard
│   ├── Product performance
│   ├── Customer segments
│   └── Conversion funnel
│
├── /agents ─────────────────────── Agent management
│   ├── Agent list with status
│   ├── /agents/[id] ───────────── Agent detail + logs
│   ├── Cron job schedules
│   └── Agent configuration
│
├── /settings ───────────────────── Platform settings
│   ├── Store settings
│   ├── Integrations (Shopify, payments, shipping)
│   ├── Brand voice & identity
│   ├── Notification preferences
│   └── Team management
│
└── /chat ───────────────────────── Persistent AI chat sidebar
    ├── Natural language commands
    ├── Agent responses
    └── Approval cards
```

---

## Page Details

---

### `/dashboard` — Default Landing Page

**Purpose:** Morning briefing and command center. First thing the user sees every day.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Metric Cards** (4) | Revenue ($), Orders (count), Conversion (%), Visitors (count). Each with sparkline and % change vs. previous period. |
| **Agent Activity Feed** | Chronological log of agent actions overnight. Filterable by agent. Shows "approved by you" vs "auto-executed". |
| **Alerts Panel** | Priority-sorted alerts: competitor price drops, escalated tickets, trending products, inventory warnings. |
| **Quick Actions** | One-click buttons: "Add Product", "Create Campaign", "View Orders", "Chat with Agent". |
| **Revenue Chart** | 7-day / 30-day toggle. Line chart with revenue + order overlay. |

**Data Sources:**
- Shopify Admin API (orders, revenue, visitors)
- Agent memory database (activity feed, alerts)
- Analytics aggregator (conversion, trends)

**Demo Status:** 🟢 **Real** — Core demo flow starts here. Must look polished.
- Metric cards: Mock data seeded for demo store
- Agent feed: Pre-populated with realistic overnight actions
- Alerts: 2-3 staged alerts (competitor price drop, escalated ticket, trending product)

---

### `/products` — Product Catalog

**Purpose:** Browse, search, and manage all products in the store.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Product Grid** | Card layout with image, title, price, stock status, tags. Supports grid/list toggle. |
| **Search & Filter** | Full-text search. Filters: category, price range, stock status, date added, AI-managed vs. manual. |
| **Bulk Actions** | Select multiple → archive, update price, export. |
| **"Add Product" CTA** | Prominent button → opens /products/add wizard. |

**Data Sources:**
- Shopify Products API
- Local product cache (for fast search)

**Demo Status:** 🟢 **Real** — Products are real Shopify data from demo store.

---

### `/products/add` — Add Product Wizard

**Purpose:** Multi-modal product creation. The hero feature demo.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Input Method Selector** | 6 options: Voice, Image, CSV, URL, Text, Duplicate Existing. |
| **Voice Recorder** | Microphone button with waveform visualization. Transcription shown in real-time. |
| **Image Upload** | Drag-drop or camera capture. Agent extracts product info from image. |
| **CSV Importer** | File upload with column mapping preview. |
| **URL Scraper** | Paste Amazon/competitor URL → agent extracts product data. |
| **Text Input** | Freeform text → agent parses structured product. |
| **AI Generation Preview** | Shows generated: title, description, price, tags, variants, SEO score. Editable fields. |
| **Approval Flow** | Preview → Edit/Regenerate → Publish. |

**Data Sources:**
- Whisper API (voice → text)
- Vision API (image → product data)
- Web scraping (URL → product data)
- Product Curator Agent (generation + optimization)

**Demo Status:** 🟢 **Real** — This is the primary demo flow. Voice and image input must work.
- Voice: Uses browser Web Speech API + fallback to Whisper
- Image: Uses vision model for product extraction
- URL: Pre-staged Amazon URLs for demo (scraping may be flaky)

---

### `/products/[id]` — Product Detail

**Purpose:** View and edit a single product. See AI optimization history.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Product Info** | Full product card: images, title, description, price, variants, inventory. |
| **Edit Form** | Inline editing with AI suggestions. |
| **SEO Panel** | Search engine preview, meta description, keyword score. |
| **AI History** | Log of agent changes to this product (price adjustments, description updates). |
| **Competitor Price** | Side-by-side comparison with tracked competitors. |

**Data Sources:**
- Shopify Product API (single product)
- Agent memory (change history)
- Competitor Monitor Agent (price comparison)

**Demo Status:** 🟡 **Partial** — Basic layout real, AI history and competitor panel can be mock data.

---

### `/products/bulk` — Bulk Import

**Purpose:** Import hundreds of products at once via CSV.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **CSV Upload** | Drag-drop CSV/Excel file. |
| **Column Mapping** | Map CSV columns to product fields. AI suggests mappings. |
| **Preview Table** | First 10 rows preview with validation status. |
| **Error Highlighting** | Red/yellow flags for missing/invalid data. |
| **Import Progress** | Real-time progress bar with success/failure counts. |

**Data Sources:**
- File upload → Product Curator Agent processes batch

**Demo Status:** 🔴 **Mock** — UI exists, uses pre-staged CSV. Not in primary demo flow.

---

### `/orders` — Order Management

**Purpose:** View and manage all orders.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Order List** | Table: order #, customer, items, total, status, date. Sortable, filterable. |
| **Status Filters** | Tabs: All, Pending, Processing, Shipped, Delivered, Issues. |
| **Bulk Actions** | Select multiple → mark fulfilled, export, print labels. |

**Data Sources:**
- Shopify Orders API

**Demo Status:** 🟡 **Partial** — Real Shopify data, but pre-populated demo orders.

---

### `/orders/[id]` — Order Detail

**Purpose:** Full view of a single order with fulfillment timeline.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Order Summary** | Customer info, line items, totals, payment status. |
| **Fulfillment Timeline** | Visual timeline: ordered → validated → labeled → shipped → delivered. |
| **Agent Actions** | Log of what agents did (validation, carrier selection, label generation). |
| **Customer Communication** | Emails sent to customer, with ability to send manual message. |

**Data Sources:**
- Shopify Order API
- Fulfillment Agent memory
- Shipping carrier tracking API

**Demo Status:** 🟡 **Partial** — Core order data real, timeline may be partially mocked.

---

### `/orders/fulfillment` — Fulfillment Queue

**Purpose:** Orders waiting to be fulfilled. The Shipping Coordinator Agent's workspace.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Queue List** | Orders pending fulfillment, sorted by priority (express first, then date). |
| **Batch Fulfill** | Select multiple → auto-select carriers → generate all labels. |
| **Carrier Comparison** | Side-by-side rate/speed comparison for each order. |
| **Exception Queue** | Orders with issues (address problem, out of stock, payment hold). |

**Data Sources:**
- Shopify Fulfillment API
- Shipping carriers (USPS, UPS, FedEx rate APIs)
- Shipping Coordinator Agent

**Demo Status:** 🔴 **Mock** — Pre-populated queue. Not in primary demo flow.

---

### `/marketing` — Campaign Overview

**Purpose:** All campaigns at a glance. Active, scheduled, and completed.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Campaign Cards** | Each campaign: name, status, channels, dates, key metrics (impressions, clicks, conversions). |
| **Create Campaign CTA** | "New Campaign" button → natural language input → agent plans & generates. |
| **Performance Summary** | Aggregate metrics across all campaigns. |

**Data Sources:**
- Marketing Agent campaign database
- Social media APIs (Instagram, TikTok)
- Email provider API (Mailchimp/SendGrid)
- Ad platform APIs (Meta, Google)

**Demo Status:** 🟢 **Real** — This is a key demo page. Campaign creation flow must work.
- Campaigns: Mix of 1-2 real campaigns + mock historical data

---

### `/marketing/social` — Social Media Manager

**Purpose:** Create, schedule, and monitor social media posts.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Content Calendar** | Monthly/weekly view of scheduled posts by platform. |
| **Post Creator** | Text + image + scheduling. AI-generated suggestions. |
| **Platform Preview** | See how post looks on Instagram vs. TikTok vs. Twitter. |
| **Engagement Metrics** | Per-post: likes, comments, shares, saves. |

**Data Sources:**
- Social media platform APIs
- Marketing Agent (content generation)
- Image generation API (post visuals)

**Demo Status:** 🟡 **Partial** — Calendar + preview real. Posting to platforms may be mocked.

---

### `/marketing/email` — Email Campaigns

**Purpose:** Create and manage email marketing sequences.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Campaign List** | All email campaigns with open/click rates. |
| **Email Builder** | Template editor with AI-generated content blocks. |
| **Audience Selector** | Choose recipients: all customers, segments, tags. |
| **A/B Testing** | Split test subject lines, content, send times. |

**Data Sources:**
- Email service API (Mailchimp/SendGrid)
- Customer database (Shopify)
- Marketing Agent

**Demo Status:** 🔴 **Mock** — Email builder UI exists, but sending is mocked.

---

### `/marketing/ads` — Ad Campaigns

**Purpose:** Manage paid advertising campaigns.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Ad Campaign List** | Active/paused campaigns with spend and ROAS. |
| **Ad Creator** | AI-generated ad copy + creative. Platform-specific previews. |
| **Budget Manager** | Set daily/lifetime budgets, bid strategies. |
| **Performance Chart** | Spend vs. revenue over time. |

**Data Sources:**
- Meta Ads API
- Google Ads API
- Marketing Agent

**Demo Status:** 🔴 **Mock** — UI only. Ad platforms not connected in demo.

---

### `/marketing/content` — Content Library

**Purpose:** Repository of all AI-generated marketing content.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Content Grid** | All generated assets: images, copy, email templates, landing pages. |
| **Search & Filter** | By type, campaign, date, platform. |
| **Content Editor** | Edit and version control for each piece of content. |
| **Brand Voice Check** | AI scores content against brand guidelines. |

**Data Sources:**
- Marketing Agent content database
- Image storage (S3/local)
- Brand voice configuration

**Demo Status:** 🟡 **Partial** — Pre-populated with generated content from demo campaign.

---

### `/competitors` — Competitive Intelligence

**Purpose:** Track competitors, compare prices, respond to market changes.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Competitor List** | Cards for each tracked competitor: name, URL, products tracked, last scan. |
| **Price Comparison Table** | Side-by-side: your products vs. competitor prices. Color-coded (green=cheaper, red=more expensive). |
| **Alerts History** | Chronological list of all competitor alerts with actions taken. |
| **Add Competitor** | URL input → agent scrapes and begins tracking. |

**Data Sources:**
- Competitor Monitor Agent (web scraping)
- Price history database
- Alert system

**Demo Status:** 🟢 **Real** — Key demo page. Must show realistic competitor data.
- 2-3 pre-configured competitors with realistic product prices
- 1 staged "price drop" alert for demo trigger

---

### `/support` — Customer Support

**Purpose:** Manage customer support tickets with AI assistance.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Ticket Queue** | List of open tickets: #, customer, subject, status, priority, assigned (AI/human). |
| **Status Filters** | Open, In Progress, Escalated, Resolved, Closed. |
| **AI Summary** | Per-ticket: AI-generated summary + suggested response. |

**Data Sources:**
- Support Agent ticket database
- Shopify customer data
- Order history (for context)

**Demo Status:** 🟡 **Partial** — Ticket list with 5-8 demo tickets. Escalated ticket in demo flow.

---

### `/support/[id]` — Ticket Detail

**Purpose:** Full view of a support ticket with conversation and AI assistance.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Conversation Thread** | Customer messages + agent/human responses. |
| **AI Draft Response** | Agent's suggested reply. Editable before sending. |
| **Customer Context** | Order history, previous tickets, lifetime value. |
| **Quick Actions** | Refund, replace, discount code, escalate. |

**Data Sources:**
- Support Agent
- Shopify customer/order APIs
- Agent memory

**Demo Status:** 🟡 **Partial** — 1-2 fully populated ticket details for demo walkthrough.

---

### `/support/policies` — Store Policies

**Purpose:** Manage return, refund, shipping, and privacy policies.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Policy Editor** | Rich text editor for each policy type. |
| **AI Generator** | Generate policies based on store category + region. |
| **Customer-Facing Preview** | How policies appear on storefront. |

**Data Sources:**
- Settings database
- Shopify policy pages
- Support Agent (policy-aware responses)

**Demo Status:** 🔴 **Mock** — Pre-filled policies. Not in demo flow.

---

### `/analytics` — Business Intelligence

**Purpose:** Deep-dive analytics and reporting.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Revenue Dashboard** | Revenue over time, by channel, by product category. |
| **Product Performance** | Top/bottom products, inventory velocity, margin analysis. |
| **Customer Segments** | RFM analysis, new vs. returning, geographic distribution. |
| **Conversion Funnel** | Visitor → product view → cart → checkout → purchase. Drop-off analysis. |

**Data Sources:**
- Shopify Analytics API
- Google Analytics (if connected)
- Internal analytics aggregator

**Demo Status:** 🟡 **Partial** — Charts exist with mock data. Not primary demo flow.

---

### `/agents` — Agent Management

**Purpose:** Monitor and configure the 6 AI agents.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Agent List** | Cards for each agent: name, status (idle/working), actions today, success rate. |
| **Status Indicators** | Green (healthy), yellow (warning), red (error). |
| **Quick Controls** | Pause/resume individual agents. |

**Data Sources:**
- Agent orchestrator
- Agent memory databases
- System health monitor

**Demo Status:** 🟢 **Real** — Must show 6 agents with realistic status. Agent detail page is secondary.

**The 6 Agents:**
| # | Agent | Status Indicator |
|---|-------|-----------------|
| 1 | 🏪 Store Builder Agent | Configured ✓ |
| 2 | 📦 Product Curator Agent | Active (12 products managed) |
| 3 | 💰 Dynamic Pricing Agent | Active (3 price changes today) |
| 4 | 📣 Marketing Agent | Active (1 campaign running) |
| 5 | 🔍 Competitor Monitor Agent | Active (last scan: 2h ago) |
| 6 | 🤝 Customer Support Agent | Active (5 tickets processed) |

---

### `/agents/[id]` — Agent Detail + Logs

**Purpose:** Deep view into a single agent's activity, configuration, and performance.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Agent Info** | Name, description, model used, cron schedule, current status. |
| **Activity Log** | Chronological log of all actions taken. Filterable. |
| **Performance Metrics** | Actions taken, success rate, avg response time, human approval rate. |
| **Configuration** | Edit agent parameters (e.g., pricing thresholds, auto-approve rules). |
| **Memory/Context** | What the agent has learned. Stored preferences and patterns. |

**Data Sources:**
- Individual agent database
- Agent memory system
- Cron scheduler

**Demo Status:** 🟡 **Partial** — Basic layout real, logs pre-populated. Config editing is mock.

---

### `/agents/cron` — Cron Job Schedules

**Purpose:** View and manage all scheduled agent tasks.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Schedule Table** | Job name, agent, cron expression, last run, next run, status. |
| **Run History** | Past executions with duration and outcome. |
| **Manual Trigger** | "Run Now" button for any scheduled job. |

**Data Sources:**
- Cron scheduler (node-cron or system cron)
- Agent orchestrator

**Demo Status:** 🔴 **Mock** — Table with realistic cron entries. Not in demo flow.

---

### `/agents/config` — Agent Configuration

**Purpose:** Global agent settings and trust levels.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Trust Levels** | Per-agent trust slider (Manual → Assisted → Supervised → Autonomous). |
| **Global Rules** | "Always ask before price changes > 10%", "Auto-approve support responses under $20". |
| **Notification Settings** | Which agent actions trigger notifications. |

**Data Sources:**
- Settings database
- Agent orchestrator

**Demo Status:** 🔴 **Mock** — UI exists but settings aren't wired to real agent behavior.

---

### `/settings` — Platform Settings

**Purpose:** Configure store-wide settings and integrations.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Store Settings** | Store name, URL, currency, timezone, language. |
| **Integrations** | Shopify connection status, payment providers, shipping carriers, social accounts. |
| **Brand Voice** | Tone selector (professional/casual/playful/luxury), custom vocabulary, banned words. |
| **Notifications** | Email, push, SMS preferences per event type. |
| **Team** | Add/remove team members, set roles (owner/admin/viewer). |

**Data Sources:**
- Settings database
- Shopify Store API
- Integration configs

**Demo Status:** 🟡 **Partial** — Store settings real (from onboarding). Integrations show connection status. Team is mock.

---

### `/chat` — Persistent AI Chat Sidebar

**Purpose:** Natural language interface to the entire platform. Always accessible.

**Key Components:**
| Component | Description |
|-----------|-------------|
| **Chat Input** | Text input + voice button. Always visible sidebar or overlay. |
| **Message Thread** | Conversation history with the AI. |
| **Approval Cards** | Interactive cards for approve/reject actions inline in chat. |
| **Quick Commands** | Suggested prompts: "Add product", "Create campaign", "Check competitors". |
| **Context Awareness** | Agent knows which page you're on and adapts responses. |

**Data Sources:**
- All agents (routed by intent)
- Current page context
- Conversation memory

**Demo Status:** 🟢 **Real** — Chat is core to the demo. Must handle:
- "Add a product" → triggers product wizard
- "What's my revenue today?" → returns dashboard data
- "Competitor dropped prices" → shows competitor analysis
- Approval cards for agent recommendations

---

## Demo Flow (Primary Path)

The hackathon demo follows this exact page sequence:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. DASHBOARD │───▶│  2. PRODUCTS │───▶│  3. COMPETITORS│
│  Morning      │    │  /add        │    │  Price drop   │
│  briefing     │    │  Voice/image │    │  alert        │
│  + alerts     │    │  product add │    │  + response   │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
       ┌───────────────────────────────────────┘
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 4. MARKETING │───▶│  5. LANDING  │───▶│  6. DASHBOARD │
│  /campaign   │    │  PAGE PREVIEW │    │  Full circle  │
│  Summer sale │    │  Generated    │    │  "Store runs  │
│  campaign    │    │  by agent     │    │   itself"     │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Demo Script:**
1. **Dashboard** → "Here's what happened overnight. Our agents processed 23 orders and flagged 3 issues."
2. **Add Product** → "Watch me add a product by voice." → Speak product details → Agent generates listing → Approve
3. **Competitors** → "A competitor just dropped their price." → Show alert → Agent recommends response → Approve price change
4. **Marketing** → "Now let's create a summer sale campaign." → Agent generates social posts, email, landing page → Preview all → Approve
5. **Landing Page** → "Here's the landing page the agent created." → Show generated page
6. **Dashboard** → "Everything is running. The agents are working while I talk to you."

---

## Component Status Summary

| Status | Count | Description |
|--------|-------|-------------|
| 🟢 Real | 5 pages | Fully functional with real data for demo |
| 🟡 Partial | 9 pages | Core layout real, some panels mocked |
| 🔴 Mock | 5 pages | UI exists but uses mock data, not in demo flow |

**Priority for hackathon:** Get the 5 🟢 pages to 100%, then polish 🟡 pages that appear in demo flow.
