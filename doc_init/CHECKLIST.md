# 🏗️ GrowthX Hermes Buildathon — Progress Checklist

> **Project:** HermesStore
> **Timeline:** 8 hours
> **Last updated:** _(fill in date)_

---

## 🏛️ Architecture Decision

> **We use the Hermes API Server (built-in) instead of a custom backend.**
>
> Hermes ships with a built-in HTTP/SSE gateway on `http://localhost:8642`.
> The Next.js frontend talks directly to Hermes endpoints — no Express server, no custom API routes, no extra infrastructure.
>
> **Key endpoints:**
> | Endpoint | Purpose |
> |----------|---------|
> | `GET /health` | Gateway health check |
> | `POST /v1/chat/completions` | Chat with Hermes (OpenAI-compatible, SSE streaming) |
> | `GET /api/jobs` | List cron/scheduled jobs |
> | `GET /api/sessions` | List agent sessions |
> | `POST /v1/runs/{id}/approval` | Approve/reject agent actions |
>
> **Start the gateway:** `hermes -p hermesstore gateway`
>
> **Why this matters:**
> - Zero custom backend code to write, debug, or deploy
> - Built-in SSE streaming (no manual SSE setup)
> - Built-in approval flow for destructive actions
> - Built-in cron/job management
> - Focus all dev time on the frontend + agent config

---

## Phase 0: Setup & Registration (Before Event)

> ⏱️ Complete **before** the timer starts. Every minute counts.

- [ ] Convex account created + project `hermesstore`
- [ ] Cloudflare account created (free tier)
- [ ] Shopify partner account + dev store created
- [ ] Wispr Flow installed + voice dictation tested
- [ ] Google Form for lead collection created + link ready
- [ ] Node.js (v18+), Python (3.11+), Git installed
- [ ] Hermes Agent installed and `hermes doctor` passes
- [ ] Hermes profile `hermesstore` created (`hermes profile create hermesstore`)
- [ ] Hermes `.env` configured (`API_SERVER_ENABLED=true`, `API_SERVER_KEY=xxx`)
- [ ] Hermes gateway tested (`curl http://localhost:8642/health`)
- [ ] Laptop charged to 100% + charger packed

**Checkpoint:** All accounts active, all tools responding, hardware ready.

---

## Phase 1: Foundation (Hour 0–1.5)

> 🎯 Goal: A working chat UI that talks to Hermes via the built-in API server.

- [ ] Frontend scaffolded — `npx create-next-app` + shadcn/ui init
- [ ] Chat interface working — send a message, see a reply
- [ ] Hermes profile `hermesstore` created
- [ ] Shopify MCP server configured in profile config
- [ ] Hermes gateway running (`hermes -p hermesstore gateway`)
- [ ] Chat page connected to Hermes API Server (`http://localhost:8642/v1/chat/completions`)

**Checkpoint:** Open browser → type "Show me my products" → see streamed response from Hermes.

---

## Phase 2: Core Store Operations (Hour 1.5–3.5)

> 🎯 Goal: Three agents operational — Product Lister, Pricing Strategist, Landing Page Builder.

- [ ] Product Lister agent — natural language input → creates product in Shopify
- [ ] Product Lister agent — voice input (Wispr Flow → text → agent)
- [ ] Product Lister agent — image upload → extracts product info → creates listing
- [ ] Pricing Strategist agent — suggests pricing based on competitor data
- [ ] Landing Page Builder agent — generates product landing page HTML
- [ ] Dashboard fetching from Hermes `/api/jobs` and `/api/sessions`
- [ ] Approval flow using Hermes built-in endpoint (`/v1/runs/{id}/approval`)
- [ ] Agent activity feed showing real-time actions in sidebar

**Checkpoint:** Demo flow: speak a product name → agent lists it → dashboard updates.

---

## Phase 3: Monitoring & Cron Jobs (Hour 3.5–5)

> 🎯 Goal: Automated monitoring agents running on schedule, alerts visible.

- [ ] Store Health Monitor — cron every 15 min, checks store status
- [ ] Competitor Price Monitor — cron every 30 min, scrapes competitor prices
- [ ] Inventory Tracker — cron every 20 min, flags low-stock items
- [ ] Analytics Digest — cron hourly, summarises store metrics
- [ ] Cron jobs created via Hermes `/api/jobs` endpoint
- [ ] Alerts rendering in dashboard with severity badges

**Checkpoint:** Wait for first cron cycle → see alert appear in dashboard without manual trigger.

---

## Phase 4: Marketing & Outreach (Hour 5–6)

> 🎯 Goal: Marketing content generated and ready to ship.

- [ ] Social media post generator — product → Instagram/Twitter copy
- [ ] Content creator — generates product images via AI image generation
- [ ] WhatsApp promo message drafted and ready to send
- [ ] Lead list loaded in Convex (from Google Form responses)

**Checkpoint:** Generate a social post for a product → preview it → copy ready to paste.

---

## Phase 5: Polish & Hardening (Hour 6–7)

> 🎯 Goal: Demo-ready UI, all flows tested, no obvious breakage.

- [ ] Dashboard looks production-quality — spacing, colors, responsive
- [ ] All demo flows tested end-to-end (happy path only)
- [ ] Voice commands working reliably (Wispr → agent → response)
- [ ] Error states handled gracefully (no white screens)
- [ ] Loading indicators on all async operations

**Checkpoint:** Run through the full demo script once. Fix anything that breaks.

---

## Phase 6: Demo Preparation (Hour 7–8)

> 🎯 Goal: Ship it. Present it. Close it.

- [ ] Backup video recorded (full demo walkthrough, 3–5 min)
- [ ] Talking points memorised (5 key beats, 60 seconds each)
- [ ] Live URL deployed to Cloudflare Pages
- [ ] Pre-demo checklist verified:
  - [ ] Dev server running / Cloudflare deployment live
  - [ ] Shopify store has at least 3 products
  - [ ] Dashboard loads clean
  - [ ] Voice demo works on stage mic
- [ ] ₹9 payment link tested — end-to-end checkout works

**Checkpoint:** Deep breath. You're ready. 🚀

---

## Quick Reference

| Phase | Time Block | Key Deliverable |
|-------|-----------|-----------------|
| 0 | Pre-event | All accounts + tools + Hermes gateway ready |
| 1 | Hour 0–1.5 | Chat UI + Hermes API Server connection |
| 2 | Hour 1.5–3.5 | 3 agents + approval flow + dashboard |
| 3 | Hour 3.5–5 | Cron monitoring + alerts |
| 4 | Hour 5–6 | Marketing content pipeline |
| 5 | Hour 6–7 | Polished UI, tested flows |
| 6 | Hour 7–8 | Deployed + demo-ready |

---

## Time Budget Cheat Sheet

If you're behind schedule, cut in this order:
1. **Voice input** — demo with text, mention voice works
2. **Image upload agent** — two agents still impress
3. **Competitor monitor** — health monitor + inventory are more compelling
4. **WhatsApp promo** — social posts alone are enough
5. **Landing page builder** — dashboard + agents carry the demo

**Never cut:** Chat streaming, Product Lister, Dashboard, Deployed URL, Backup video.
