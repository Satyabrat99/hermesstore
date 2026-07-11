# HermesStore — User Workflows

> Six complete user journeys with ASCII flow diagrams. Each journey maps every step, decision point, and agent interaction.

---

## Journey 1: First-Time Store Setup

**Goal:** Brand-new user goes from zero to a live, AI-managed store in under 10 minutes.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FIRST-TIME STORE SETUP                           │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │  User opens   │
  │  HermesStore  │
  └──────┬───────┘
         ▼
  ┌──────────────────┐     ┌────────────────────────────┐
  │  Has account?     │──N──▶  Sign up / OAuth flow       │
  └──────┬───────────┘     └──────────────┬─────────────┘
         │ Y                              │
         ▼                                │
  ┌──────────────────┐                    │
  │  Has store?       │◀──────────────────┘
  └──────┬───────────┘
         │ N
         ▼
  ╔══════════════════╗
  ║ ONBOARDING WIZARD ║
  ╚════════╤═════════╝
           ▼
  ┌──────────────────────────────────────────┐
  │  Step 1: Store Basics                     │
  │  • Store name                             │
  │  • Category (Fashion / Food / Tech / ...) │
  │  • Target market (US / EU / Global)       │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 2: Brand Identity                   │
  │  • Upload logo (or generate with AI)      │
  │  • Pick brand colors (palette picker)     │
  │  • Set brand voice (Professional / Casual │
  │    / Playful / Luxury)                    │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 3: Agent Provisioning               │
  │  ┌─────────────────────────────────────┐ │
  │  │ 🤖 Creating Shopify store...        │ │
  │  │ 🤖 Configuring theme & layout...    │ │
  │  │ 🤖 Setting up payment gateway...    │ │
  │  │ 🤖 Creating shipping zones...       │ │
  │  │ 🤖 Deploying 6 AI agents...        │ │
  │  └─────────────────────────────────────┘ │
  │  (Progress bar + real-time status)        │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 4: Add First Products               │
  │                                           │
  │  Choose method:                           │
  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐│
  │  │Voice│ │Image│ │ CSV │ │ URL │ │Text││
  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └─┬──┘│
  │     │       │       │       │       │   │
  │     ▼       ▼       ▼       ▼       ▼   │
  │  Agent generates product listings         │
  │  (title, description, price, images, SEO) │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 5: Shipping Setup                   │
  │  • Select carriers (auto-detected region) │
  │  • Set rates (flat / weight / free)       │
  │  • Define shipping zones                  │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 6: Payment Setup                    │
  │  • Connect Stripe / Shopify Payments      │
  │  • Enable additional methods (PayPal,     │
  │    Apple Pay, Klarna)                     │
  │  • Test transaction                        │
  └──────────────┬───────────────────────────┘
                 ▼
  ╔══════════════════════╗
  ║  🎉 STORE IS LIVE!   ║
  ║                       ║
  ║  → Go to Dashboard    ║
  ║  → Add more products  ║
  ║  → Start marketing    ║
  ╚══════════════════════╝
```

**Agent Interactions:**
- Store Builder Agent: Provisions Shopify store, applies theme, configures settings
- Product Curator Agent: Generates listings from any input method
- All 6 agents are deployed and begin monitoring immediately after setup

---

## Journey 2: Daily Store Management

**Goal:** Store owner starts their day with an AI-curated briefing and makes quick decisions.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DAILY STORE MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │  User opens app   │
  │  (morning coffee) │
  └──────┬───────────┘
         ▼
  ╔══════════════════════════════════════════╗
  ║           DASHBOARD (default landing)     ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  📊 Overnight Summary                    ║
  ║  ├── Revenue: $1,247 (+12% vs yesterday)  ║
  ║  ├── Orders: 23                           ║
  ║  ├── Visitors: 1,847                      ║
  ║  └── Conversion: 1.25%                    ║
  ║                                           ║
  ╚═══════════════╤═════════════════════════╝
                  ▼
  ┌──────────────────────────────────────────┐
  │  📬 Overnight Alerts (3)                  │
  │                                           │
  │  ⚠️  Competitor dropped price on          │
  │     "Wireless Earbuds Pro" by 15%         │
  │     [View Details]                        │
  │                                           │
  │  🎫 2 support tickets escalated           │
  │     (auto-resolved 5, escalated 2)        │
  │     [Review Tickets]                      │
  │                                           │
  │  📈 "Summer Collection" trending          │
  │     +340% search volume                   │
  │     [Create Campaign]                     │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  🤖 Agent Recommendations (pending)       │
  │                                           │
  │  ┌────────────────────────────────────┐   │
  │  │ Price Adjustment                    │   │
  │  │ "Wireless Earbuds Pro"              │   │
  │  │ Current: $49.99 → Recommended: $44.99│  │
  │  │ Reason: Competitor match + margin OK │  │
  │  │                                     │   │
  │  │ Impact: +8% volume, -3% margin       │   │
  │  │ Net: +4.8% revenue                   │   │
  │  │                                     │   │
  │  │ [✓ Approve]  [✗ Reject]  [💬 Edit]   │   │
  │  └────────────────────────────────────┘   │
  │                                           │
  │  ┌────────────────────────────────────┐   │
  │  │ Support Response                    │   │
  │  │ Ticket #1847: "Item not received"   │   │
  │  │ Agent drafted: refund + apology      │   │
  │  │ [✓ Approve]  [✗ Edit & Send]         │   │
  │  └────────────────────────────────────┘   │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Decision Point per item:                 │
  │                                           │
  │       ┌──────────┐                        │
  │       │ Approve?  │                        │
  │       └────┬─────┘                        │
  │        Y   │   N                           │
  │        │   │   │                           │
  │        ▼   │   ▼                           │
  │   ┌────────┐  ┌──────────────┐             │
  │   │ Execute│  │ Edit / Provide│             │
  │   │ action │  │ feedback      │             │
  │   └───┬────┘  └──────┬───────┘             │
  │       │              │                     │
  │       ▼              ▼                     │
  │   Agent takes    Agent adjusts             │
  │   action         & re-learns               │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  📊 Analytics Digest                      │
  │  • Top products today                     │
  │  • Traffic sources breakdown              │
  │  • Customer sentiment (from support)      │
  │  • Weekly trend sparklines                │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────┐
  │  Day begins —     │
  │  agents work       │
  │  autonomously      │
  │  until next alert  │
  └──────────────────┘
```

**Key Principle:** Every agent action requires human approval until the user builds trust. Over time, users can enable auto-approve for low-risk actions.

---

## Journey 3: Product Management

**Goal:** Add a product to the store from any input method in under 60 seconds.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRODUCT MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────┐     ┌───────────────────────┐
  │  User: "Add product"│     │  Via /products page    │
  │  (chat command)     │     │  → Click "Add Product" │
  └────────┬───────────┘     └───────────┬───────────┘
           │                             │
           └──────────┬──────────────────┘
                      ▼
  ╔══════════════════════════════════════════╗
  ║         ADD PRODUCT WIZARD                ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Choose input method:                     ║
  ║                                           ║
  ║  🎤 Voice    📷 Image    📄 CSV            ║
  ║  🔗 URL      ✏️ Text     🔁 Existing       ║
  ║                                           ║
  ╚══════════════════╤══════════════════════╝
                     ▼
        ┌─────────────────────────┐
        │    INPUT METHOD          │
        └─────────┬───────────────┘
                  │
     ┌────────────┼────────────────────────────────┐
     │            │            │           │         │
     ▼            ▼            ▼           ▼         ▼
  ┌──────┐   ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │Voice │   │Upload     │ │Paste   │ │Paste   │ │Type    │
  │record│   │product    │ │CSV     │ │product │ │title + │
  │"Blue │   │photo      │ │file    │ │URL     │ │desc    │
  │t-shirt│  │           │ │        │ │(Amazon │ │        │
  │$29   │   │           │ │        │ │etc.)   │ │        │
  │cotton│   │           │ │        │ │        │ │        │
  │size" │   │           │ │        │ │        │ │        │
  └──┬───┘   └─────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
     │             │          │          │          │
     └─────────────┴──────────┴──────────┴──────────┘
                           │
                           ▼
  ╔══════════════════════════════════════════╗
  ║  🤖 AGENT GENERATES LISTING               ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Processing...                             ║
  ║  ├─ ✅ Parsing input                       ║
  ║  ├─ ✅ Generating title (SEO-optimized)     ║
  ║  ├─ ✅ Writing description (brand voice)    ║
  ║  ├─ ✅ Setting price (market analysis)      ║
  ║  ├─ ✅ Generating tags & categories         ║
  ║  ├─ ✅ Creating image alt text              ║
  ║  └─ ✅ Suggesting variants (size/color)     ║
  ║                                           ║
  ╚═══════════════════╤═════════════════════╝
                      ▼
  ┌──────────────────────────────────────────┐
  │  📋 PRODUCT PREVIEW                        │
  │                                           │
  │  ┌─────────────────────────────────────┐  │
  │  │  [Product Image]                     │  │
  │  │                                      │  │
  │  │  Blue Classic Cotton T-Shirt         │  │
  │  │  $29.99                              │  │
  │  │                                      │  │
  │  │  Crafted from 100% organic cotton,   │  │
  │  │  this classic-fit tee delivers       │  │
  │  │  all-day comfort with a timeless     │  │
  │  │  silhouette...                       │  │
  │  │                                      │  │
  │  │  Tags: t-shirt, cotton, basics       │  │
  │  │  Category: Apparel > Tops            │  │
  │  │  Variants: S, M, L, XL               │  │
  │  └─────────────────────────────────────┘  │
  │                                           │
  │  AI Confidence: 94%                       │
  │  SEO Score: 87/100                        │
  │                                           │
  │  [✓ Publish]  [✏️ Edit]  [🔄 Regenerate]   │
  └──────────────┬───────────────────────────┘
                 ▼
        ┌────────────────────────┐
        │  User approves?         │
        └────┬──────────────────┘
         Y   │            N
         │   │            │
         ▼   │            ▼
  ┌──────────────┐  ┌──────────────────┐
  │ 🚀 Product   │  │ User edits fields │
  │ LIVE in store │  │ or regenerates    │
  │               │  │ → Back to preview │
  └──────────────┘  └──────────────────┘
```

**Voice Input Detail:**
- Supports natural language: *"Add a blue cotton t-shirt, twenty-nine ninety-nine, sizes small through extra large"*
- Agent parses structured data from conversational speech
- Fallback: asks clarifying questions if ambiguous

---

## Journey 4: Marketing Campaign

**Goal:** Launch a multi-channel marketing campaign from a single natural language command.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MARKETING CAMPAIGN                               │
└─────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────┐
  │  User: "Create campaign for        │
  │         summer sale, 20% off       │
  │         all apparel, runs July"    │
  └──────────────┬────────────────────┘
                 ▼
  ╔══════════════════════════════════════════╗
  ║  🤖 MARKETING AGENT — CAMPAIGN PLANNER    ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Analyzing...                             ║
  ║  ├─ ✅ Store inventory (47 apparel items)  ║
  ║  ├─ ✅ Customer segments (3 target groups) ║
  ║  ├─ ✅ Historical campaign performance     ║
  ║  ├─ ✅ Competitor promotions (current)     ║
  ║  └─ ✅ Optimal channel mix                 ║
  ║                                           ║
  ║  Campaign Plan:                           ║
  ║  ├─ 📱 Social: 5 posts (Instagram, TikTok)║
  ║  ├─ 📧 Email: 3-part drip sequence        ║
  ║  ├─ 📄 Landing page: summer-sale          ║
  ║  └─ 📢 Ad campaign: retargeting + lookalike║
  ║                                           ║
  ╚═══════════════════╤═════════════════════╝
                      ▼
  ┌──────────────────────────────────────────┐
  │  📱 SOCIAL POSTS (preview all 5)          │
  │                                           │
  │  ┌──────────────────────┐                 │
  │  │ Post 1: Teaser        │                 │
  │  │ "☀️ Something hot is   │                 │
  │  │  coming... 🔥"         │                 │
  │  │ [Generated image]     │                 │
  │  │ Scheduled: July 1     │                 │
  │  └──────────────────────┘                 │
  │  ┌──────────────────────┐                 │
  │  │ Post 2: Launch        │                 │
  │  │ "SUMMER SALE IS LIVE  │                 │
  │  │  20% off everything"  │                 │
  │  │ [Generated image]     │                 │
  │  │ Scheduled: July 3     │                 │
  │  └──────────────────────┘                 │
  │  ... (3 more posts)                       │
  │                                           │
  │  [✓ Approve All] [✏️ Edit Individual]      │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  📧 EMAIL SEQUENCE (preview)              │
  │                                           │
  │  Email 1: Announcement (July 1)           │
  │  Email 2: Best sellers highlight (July 5) │
  │  Email 3: Last chance (July 28)           │
  │                                           │
  │  [✓ Approve All] [✏️ Edit Individual]      │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  📄 LANDING PAGE (preview)                │
  │                                           │
  │  ┌──────────────────────────────────┐     │
  │  │  SUMMER SALE                      │     │
  │  │  20% OFF ALL APPAREL              │     │
  │  │  [Hero image] [Product grid]      │     │
  │  │  [Countdown timer] [CTA button]   │     │
  │  └──────────────────────────────────┘     │
  │                                           │
  │  [✓ Approve] [✏️ Edit] [👁️ Full Preview]   │
  └──────────────┬───────────────────────────┘
                 ▼
        ┌────────────────────────┐
        │  All approved?          │
        └────┬──────────────────┘
         Y   │            N
         │   │            │
         ▼   │            ▼
  ╔══════════════════╗  ┌──────────────────┐
  ║ 🚀 PUBLISHING     ║  │ Edit & re-preview │
  ║                    ║  │ specific items    │
  ║ ✅ Social scheduled ║  └──────────────────┘
  ║ ✅ Emails queued    ║
  ║ ✅ Landing page live║
  ║ ✅ Ads activated    ║
  ║                    ║
  ║ All channels live! ║
  ╚══════════════════╝
                 ▼
  ┌──────────────────────────────────────────┐
  │  📊 Campaign dashboard created            │
  │  Track: impressions, clicks, conversions  │
  │  Agent will optimize in real-time          │
  └──────────────────────────────────────────┘
```

---

## Journey 5: Competitor Response

**Goal:** React to competitive threats automatically with human-in-the-loop approval.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPETITOR RESPONSE                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │  🤖 Competitor Monitor Agent          │
  │  (runs every 4 hours via cron)        │
  │                                       │
  │  Detected: "TechRival" dropped price  │
  │  on "Wireless Earbuds Pro"            │
  │  Was: $54.99 → Now: $46.74 (-15%)     │
  └──────────────┬──────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  🚨 ALERT: Dashboard + Push Notification  │
  │                                           │
  │  ┌─────────────────────────────────────┐  │
  │  │ ⚠️ PRICE DROP ALERT                  │  │
  │  │                                      │  │
  │  │ Competitor: TechRival                │  │
  │  │ Product: Wireless Earbuds Pro        │  │
  │  │ Their price: $46.74 (was $54.99)     │  │
  │  │ Your price: $49.99                   │  │
  │  │ Gap: $3.25 (6.5% higher)             │  │
  │  │                                      │  │
  │  │ Market position: #3 → risk of #5     │  │
  │  └─────────────────────────────────────┘  │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  🤖 Agent Analysis (auto-generated)       │
  │                                           │
  │  Recommended Response Options:            │
  │                                           │
  │  ┌─────────────────────────────────────┐  │
  │  │ Option A: Match price                │  │
  │  │ $49.99 → $46.74                      │  │
  │  │ Margin: 38% → 32% (acceptable)       │  │
  │  │ Expected volume: +12%                │  │
  │  │ [✓ Select]                           │  │
  │  ├─────────────────────────────────────┤  │
  │  │ Option B: Partial match              │  │
  │  │ $49.99 → $47.99                      │  │
  │  │ Margin: 38% → 35% (good)             │  │
  │  │ Expected volume: +5%                 │  │
  │  │ [✓ Select]                           │  │
  │  ├─────────────────────────────────────┤  │
  │  │ Option C: Hold + differentiate       │  │
  │  │ Keep $49.99, add bundle offer        │  │
  │  │ Margin: 38% (unchanged)              │  │
  │  │ Expected volume: -3% (but +AOV)      │  │
  │  │ [✓ Select]                           │  │
  │  └─────────────────────────────────────┘  │
  └──────────────┬───────────────────────────┘
                 ▼
        ┌────────────────────────┐
        │  User selects option    │
        └────┬──────────────────┘
             ▼
  ┌──────────────────────────────────────────┐
  │  User approves → Agent executes:          │
  │                                           │
  │  ✅ Price updated in Shopify               │
  │  ✅ Price comparison table updated         │
  │                                           │
  │  ┌─── Cascading Effects ──────────────┐   │
  │  │                                      │  │
  │  │  🤖 Marketing Agent notified          │  │
  │  │  ├─ Adjusts ad copy ("Best price!")   │  │
  │  │  ├─ Updates email content              │  │
  │  │  └─ Refreshes landing page badge       │  │
  │  │                                      │  │
  │  │  🤖 Pricing Agent logs change          │  │
  │  │  └─ Tracks for future optimization     │  │
  │  └──────────────────────────────────────┘  │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  📊 Outcome tracked over 7 days          │
  │  • Volume change: TBD                     │
  │  • Revenue impact: TBD                    │
  │  • Market position: TBD                   │
  │  • Competitor reaction: monitoring...     │
  └──────────────────────────────────────────┘
```

---

## Journey 6: Order Fulfillment

**Goal:** From order placement to delivery tracking — fully automated with exception handling.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ORDER FULFILLMENT                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────┐
  │  📦 New order arrives         │
  │  (Shopify webhook → Agent)    │
  │                               │
  │  Order #4821                  │
  │  2x Wireless Earbuds Pro      │
  │  1x USB-C Cable (6ft)         │
  │  Customer: Jane D.            │
  │  Shipping: Standard (5-7 day) │
  └──────────────┬──────────────┘
                 ▼
  ╔══════════════════════════════════════════╗
  ║  🤖 ORDER PROCESSOR AGENT                 ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Validation checks:                       ║
  ║  ├─ ✅ Payment verified                    ║
  ║  ├─ ✅ Fraud check passed (risk score: 2%) ║
  ║  ├─ ✅ Inventory available (earbuds: 47)   ║
  ║  ├─ ✅ Address validated                    ║
  ║  └─ ✅ No duplicate order detected          ║
  ║                                           ║
  ╚═══════════════════╤═════════════════════╝
                      ▼
            ┌────────────────────┐
            │  All checks pass?   │
            └────┬──────────────┘
          Y     │         N
          │     │         │
          ▼     │         ▼
  ┌──────────────┐  ┌──────────────────────┐
  │  Proceed to   │  │  Flag for review      │
  │  fulfillment  │  │  ├─ Payment issue?    │
  └──────┬───────┘  │  │  → Contact payment   │
         │          │  │    provider           │
         │          │  ├─ Inventory issue?   │
         │          │  │  → Backorder flow    │
         │          │  ├─ Fraud concern?     │
         │          │  │  → Manual review     │
         │          │  └─ Address issue?     │
         │          │     → Customer contact │
         │          └──────────────────────┘
         ▼
  ╔══════════════════════════════════════════╗
  ║  🤖 SHIPPING COORDINATOR AGENT            ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Carrier selection:                       ║
  ║  ├─ Comparing rates (USPS, UPS, FedEx)    ║
  ║  ├─ Checking delivery speed requirement   ║
  ║  ├─ Applying negotiated discounts         ║
  ║  └─ Selected: USPS Priority ($6.80)       ║
  ║                                           ║
  ║  ✅ Shipping label generated               ║
  ║  ✅ Packing slip created                    ║
  ║                                           ║
  ╚═══════════════════╤═════════════════════╝
                      ▼
  ┌──────────────────────────────────────────┐
  │  📧 Customer Notification (auto-sent)     │
  │                                           │
  │  To: jane.doe@email.com                   │
  │  Subject: Your order is on its way! 🚚    │
  │                                           │
  │  Includes:                                │
  │  • Tracking number: 9400111899223...      │
  │  • Estimated delivery: July 15-17         │
  │  • Tracking link                          │
  └──────────────┬───────────────────────────┘
                 ▼
  ╔══════════════════════════════════════════╗
  ║  🤖 DELIVERY TRACKER AGENT                ║
  ╠══════════════════════════════════════════╣
  ║                                           ║
  ║  Monitoring shipment status...            ║
  ║                                           ║
  ║  Jul 12: Label created                    ║
  ║  Jul 12: Picked up by carrier             ║
  ║  Jul 13: In transit (Chicago, IL)         ║
  ║  Jul 14: Out for delivery                 ║
  ║  Jul 14: ✅ Delivered                      ║
  ║                                           ║
  ║  ┌─── Exception Handling ──────────────┐  ║
  ║  │ If delayed → Auto-notify customer    │  ║
  ║  │ If lost → Escalate + reship/refund   │  ║
  ║  │ If returned → Process return flow    │  ║
  ║  └─────────────────────────────────────┘  ║
  ║                                           ║
  ╚═══════════════════╤═════════════════════╝
                      ▼
  ┌──────────────────────────────────────────┐
  │  📧 Post-Delivery (auto-sent after 24h)   │
  │                                           │
  │  "Hi Jane! Your order was delivered.      │
  │   How's everything? Leave a review ⭐"     │
  │                                           │
  │  → Review request sent                    │
  │  → Support ticket created if no response  │
  │     in 7 days (satisfaction check)        │
  └──────────────────────────────────────────┘
```

---

## Cross-Journey: Agent Escalation Matrix

| Situation | Agent Action | Human Required? |
|-----------|-------------|-----------------|
| Product listing generated | Preview ready | ✅ Approve before publish |
| Price change recommended | Analysis + options | ✅ Select & approve |
| Support ticket (simple) | Draft response | ✅ Approve response |
| Support ticket (complex) | Flagged with context | ✅ Human handles |
| Competitor price drop | Alert + recommendations | ✅ Choose strategy |
| Campaign content generated | Full preview | ✅ Approve before publish |
| Order validation fail | Flag with reason | ✅ Manual resolution |
| Shipping delay detected | Auto-notify customer | ❌ (automatic) |
| Delivery confirmation | Auto-track & log | ❌ (automatic) |
| Post-delivery email | Auto-send review request | ❌ (automatic) |

---

## Trust Levels (Future Feature)

Users can set trust levels per agent over time:

```
Level 0: Manual    — Agent suggests, human approves everything
Level 1: Assisted  — Agent acts on low-risk items, asks on high-risk
Level 2: Supervised — Agent acts on most items, logs for review
Level 3: Autonomous — Agent acts independently, human gets daily digest
```

Default for new users: **Level 0 (Manual)** — every action requires approval.
