# HermesStore — Hackathon User Workflows

> **Three core user journeys** for the 8-hour hackathon demo. Simplified from the full 6-journey plan.
> **Last updated**: 2026-07-11

---

## Journey 1: First-Time Store Setup

**Goal:** Brand-new user goes from zero to a live, AI-managed store in under 5 minutes (demo version).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FIRST-TIME STORE SETUP                           │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │  User opens   │
  │  HermesStore  │
  └──────┬───────┘
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
  │  │ 🤖 Configuring theme & layout...    │ │
  │  │ 🤖 Setting up payment gateway...    │ │
  │  │ 🤖 Deploying 6 AI agents...        │ │
  │  └─────────────────────────────────────┘ │
  │  (Progress bar + real-time status)        │
  └──────────────┬───────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  Step 4: Add First Products               │
  │                                           │
  │  Choose method:                           │
  │  ┌─────┐ ┌─────┐ ┌─────┐                 │
  │  │Voice│ │Image│ │ Text│                  │
  │  └──┬──┘ └──┬──┘ └──┬──┘                 │
  │     │       │       │                     │
  │     ▼       ▼       ▼                     │
  │  Agent generates product listings         │
  │  (title, description, price, images, SEO) │
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
- Store Builder Agent: Provisions store, applies theme, configures settings
- Product Curator Agent: Generates listings from voice/image/text input
- All 6 agents deploy and begin monitoring after setup

**Demo Notes:**
- Skip signup/OAuth — use demo account
- Voice input: Browser Web Speech API + Whisper fallback
- Image input: Vision model extracts product info
- Pre-seed 2-3 products after setup for immediate demo value

---

## Journey 2: Marketing Campaign

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
  ║  └─ ✅ Optimal channel mix                 ║
  ║                                           ║
  ║  Campaign Plan:                           ║
  ║  ├─ 📱 Social: 5 posts (Instagram, TikTok)║
  ║  ├─ 📧 Email: 3-part drip sequence        ║
  ║  └─ 📄 Landing page: summer-sale          ║
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

**Demo Notes:**
- Pre-stage one campaign for walkthrough
- Social posts use skill-autoecom carousel generation
- Email/landing page can be mock for hackathon
- Approval flow is the key demo moment — HITL in action

---

## Journey 3: Customer Support

**Goal:** AI handles customer tickets with human-in-the-loop approval for escalations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER SUPPORT                                 │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │  🤖 Support Agent (runs continuously)│
  │                                       │
  │  Processing incoming tickets...       │
  │  • Auto-resolves simple queries       │
  │  • Escalates complex issues           │
  └──────────────┬──────────────────────┘
                 ▼
  ┌──────────────────────────────────────────┐
  │  📬 Dashboard Alert                       │
  │                                           │
  │  ⚠️  Ticket #1847 escalated               │
  │  Customer: "Item not received"            │
  │  Order: #ORD-4521                         │
  │  Status: 7 days since shipment            │
  │                                           │
  │  🤖 Agent Analysis:                       │
  │  • Tracking shows "in transit"            │
  │  • Similar tickets: 85% resolve with      │
  │    refund + apology                       │
  │  • Customer LTV: $347 (valuable)          │
  │                                           │
  │  Suggested Response:                      │
  │  "We sincerely apologize for the delay.   │
  │   We've issued a full refund of $49.99    │
  │   and included a 15% discount code for    │
  │   your next order. Your refund will       │
  │   appear in 3-5 business days."           │
  │                                           │
  │  [✓ Approve & Send]  [✏️ Edit Response]   │
  └──────────────┬───────────────────────────┘
                 ▼
        ┌────────────────────────┐
        │  User action?           │
        └────┬──────────────────┘
         Y   │            N
         │   │            │
         ▼   │            ▼
  ┌──────────────┐  ┌──────────────────┐
  │ ✅ Agent sends │  │ User edits text   │
  │ response +    │  │ → Agent adjusts   │
  │ processes     │  │ → Back to preview │
  │ refund        │  └──────────────────┘
  └──────┬───────┘
         ▼
  ┌──────────────────────────────────────────┐
  │  📊 Ticket resolved                       │
  │  • Customer notified                      │
  │  • Refund processed                       │
  │  • Satisfaction survey sent               │
  │  • Agent learns from feedback             │
  └──────────────────────────────────────────┘
```

**Demo Notes:**
- Pre-stage 5-8 tickets in various states (open, escalated, resolved)
- Walk through one escalated ticket approval flow
- Show auto-resolved tickets in feed (demonstrates agent autonomy)
- Key insight: "Every action requires human approval until trust is built"

---

## Key Principles (Hackathon)

1. **Human-in-the-loop**: Every agent action requires approval until user enables auto-approve
2. **Natural language interface**: Users describe what they want, agents execute
3. **Multi-channel**: Marketing spans social, email, landing pages
4. **Real-time feedback**: Agents learn from approvals/rejections

## What's NOT in Hackathon Scope

| Journey | Reason |
|---------|--------|
| Daily Store Management | Dashboard exists but not primary demo focus |
| Product Management | Covered by Store Setup + chat commands |
| Competitor Response | Dynamic pricing agent shows this, but not a standalone journey |
