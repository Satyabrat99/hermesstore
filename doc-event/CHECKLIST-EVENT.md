# 🏗️ GrowthX Hermes Buildathon — 4-Profile Event Checklist

> **Project:** HermesStore
> **Timeline:** 8 hours
> **Architecture:** 4 Hermes profiles (brain, storeops, marketing, customer-brand)
> **Last updated:** _(fill in date)_

---

## 🏛️ Architecture Decision

> **4-profile architecture with a single gateway entry point.**
>
> Instead of one monolithic profile, we split responsibilities across 4 Hermes profiles:
>
> | Profile | Role | MCP Servers |
> |---------|------|-------------|
> | `brain` | Router/orchestrator — handles all chat, routes to other profiles | _(none — pure routing)_ |
> | `storeops` | Shopify products, inventory, pricing | Shopify MCP |
> | `marketing` | Social posts, content creation, image gen, promos | Shopify MCP |
> | `customer-brand` | Support, brand voice, copywriting, reviews | Shopify MCP |
>
> **Gateway runs on `brain` only** — frontend connects to `http://localhost:8642/v1/chat/completions`.
> Brain routes requests to other profiles as needed.
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
> **Start the gateway:** `hermes -p brain gateway`

---

## Phase 0: Setup & Registration (Before Event)

> ⏱️ Complete **before** the timer starts. Every minute counts.

### Accounts & Tools
- [ ] Convex account created + project `hermesstore`
- [ ] Cloudflare account created (free tier)
- [ ] Shopify partner account + dev store created
- [ ] Wispr Flow installed + voice dictation tested
- [ ] Google Form for lead collection created + link ready
- [ ] Node.js (v18+), Python (3.11+), Git installed
- [ ] Hermes Agent installed and `hermes doctor` passes
- [ ] Laptop charged to 100% + charger packed

### Create 4 Hermes Profiles
- [ ] `hermes profile create brain`
- [ ] `hermes profile create storeops`
- [ ] `hermes profile create marketing`
- [ ] `hermes profile create customer-brand`

### Configure .env for Each Profile
- [ ] **brain** — `~/.hermes/profiles/brain/.env`:
  - `API_SERVER_ENABLED=true`
  - `API_SERVER_KEY=xxx` (generate a secure key)
  - `API_SERVER_PORT=8642`
- [ ] **storeops** — `~/.hermes/profiles/storeops/.env`:
  - Same as brain (for MCP connectivity)
  - Shopify credentials if needed
- [ ] **marketing** — `~/.hermes/profiles/marketing/.env`:
  - Same as brain
  - Shopify credentials if needed
  - Image generation API key if needed
- [ ] **customer-brand** — `~/.hermes/profiles/customer-brand/.env`:
  - Same as brain
  - Shopify credentials if needed

### Add Shopify MCP Server
- [ ] Shopify MCP added to **storeops** profile config
- [ ] Shopify MCP added to **marketing** profile config
- [ ] Shopify MCP added to **customer-brand** profile config

### Test Gateway
- [ ] `hermes -p brain gateway` starts without errors
- [ ] `curl http://localhost:8642/health` returns OK

**Checkpoint:** All 4 profiles created, .env configured, MCP attached to 3 profiles, gateway responds on :8642.

---

## Phase 1: Foundation (Hour 0–1.5)

> 🎯 Goal: Working chat UI connected to brain profile on port 8642.

- [ ] Frontend scaffolded — `npx create-next-app` + shadcn/ui init
- [ ] Chat interface working — send a message, see a reply
- [ ] Chat page connected to brain gateway (`http://localhost:8642/v1/chat/completions`)
- [ ] SSE streaming working — responses stream in character by character
- [ ] Brain can route basic queries (even if downstream profiles aren't wired yet)

**Checkpoint:** Open browser → type "Show me my products" → see streamed response from brain.

---

## Phase 2: Core Store Operations (Hour 1.5–3.5)

> 🎯 Goal: storeops profile handles products, pricing, inventory.

- [ ] Product Lister — natural language input → creates product in Shopify (via storeops)
- [ ] Product Lister — voice input (Wispr Flow → text → agent)
- [ ] Product Lister — image upload → extracts product info → creates listing
- [ ] Pricing Strategist — suggests pricing based on competitor data (via storeops)
- [ ] Landing Page Builder — generates product landing page HTML (via storeops)
- [ ] Inventory Tracker cron — every 20 min, flags low-stock items
- [ ] Dashboard page showing real data from Hermes `/api/jobs` and `/api/sessions`
- [ ] Approval flow using `/v1/runs/{id}/approval` for destructive actions

**Checkpoint:** Demo flow: speak a product name → agent lists it → dashboard updates.

---

## Phase 3: Marketing & Outreach (Hour 3.5–5)

> 🎯 Goal: marketing profile generates content and manages promos.

- [ ] Social Post Generator — product → Instagram/Twitter/WhatsApp copy (via marketing)
- [ ] Content Creator — generates product images via AI image generation (via marketing)
- [ ] ₹9 promo template — ready-to-send WhatsApp/message template
- [ ] Engagement cron — scheduled social media post reminders
- [ ] Lead list loaded (from Google Form responses)
- [ ] Marketing content pipeline working end-to-end

**Checkpoint:** Generate a social post for a product → preview it → copy ready to paste.

---

## Phase 4: Customer & Brand (Hour 5–6)

> 🎯 Goal: customer-brand profile handles support, voice, copy, reviews.

- [ ] Support Agent skill — answers customer questions from Shopify data
- [ ] Brand Voice Memory — consistent tone/personality across all outputs
- [ ] Copywriter Skill — product descriptions, ad copy, email copy
- [ ] Review Manager — monitors and responds to product reviews
- [ ] All 4 profiles routing correctly through brain

**Checkpoint:** Ask a customer support question → get brand-consistent answer. Ask for product copy → get polished description.

---

## Phase 5: Polish & Hardening (Hour 6–7)

> 🎯 Goal: Demo-ready UI, all flows tested, dashboard looks production-quality.

- [ ] Dashboard with real data — products, orders, revenue cards
- [ ] Mock cards for fulfillment, finance, analytics (visual placeholders)
- [ ] Approval flow UI — approve/reject buttons working
- [ ] All demo flows tested end-to-end (happy path only)
- [ ] Voice commands working reliably (Wispr → agent → response)
- [ ] Error states handled gracefully (no white screens)
- [ ] Loading indicators on all async operations
- [ ] Responsive layout — looks good on laptop + projector

**Checkpoint:** Run through the full demo script once. Fix anything that breaks.

---

## Phase 6: Deploy & Demo (Hour 7–8)

> 🎯 Goal: Ship it. Present it. Close it.

- [ ] Frontend deployed to Cloudflare Pages
- [ ] E2E test — full flow from chat → Shopify → dashboard
- [ ] ₹9 payment link tested — end-to-end checkout works
- [ ] Backup video recorded (full demo walkthrough, 3–5 min)
- [ ] Collect final WhatsApp numbers for lead outreach
- [ ] Talking points memorised (5 key beats, 60 seconds each)
- [ ] Pre-demo checklist verified:
  - [ ] Cloudflare deployment live + accessible
  - [ ] Shopify store has at least 3 products
  - [ ] Dashboard loads clean
  - [ ] Voice demo works on stage mic
  - [ ] Gateway running on brain (`hermes -p brain gateway`)

**Checkpoint:** Deep breath. You're ready. 🚀

---

## Quick Reference

| Phase | Time Block | Key Deliverable | Profile(s) Used |
|-------|-----------|-----------------|-----------------|
| 0 | Pre-event | 4 profiles + MCP + gateway ready | All |
| 1 | Hour 0–1.5 | Chat UI + brain gateway connection | brain |
| 2 | Hour 1.5–3.5 | Products, pricing, inventory, dashboard | storeops |
| 3 | Hour 3.5–5 | Social posts, content, promos, leads | marketing |
| 4 | Hour 5–6 | Support, brand voice, copy, reviews | customer-brand |
| 5 | Hour 6–7 | Polished UI, tested flows | All |
| 6 | Hour 7–8 | Deployed + demo-ready | All |

---

## 4-Profile Setup Commands (Copy-Paste)

```bash
# Create profiles
hermes profile create brain
hermes profile create storeops
hermes profile create marketing
hermes profile create customer-brand

# Configure brain .env
cat >> ~/.hermes/profiles/brain/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-brain-$(openssl rand -hex 16)
API_SERVER_PORT=8642
EOF

# Configure storeops .env
cat >> ~/.hermes/profiles/storeops/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-storeops-$(openssl rand -hex 16)
EOF

# Configure marketing .env
cat >> ~/.hermes/profiles/marketing/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-marketing-$(openssl rand -hex 16)
EOF

# Configure customer-brand .env
cat >> ~/.hermes/profiles/customer-brand/.env << 'EOF'
API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-customer-brand-$(openssl rand -hex 16)
EOF

# Add Shopify MCP to storeops, marketing, customer-brand
# (Add to each profile's config.yaml)
hermes -p storeops config set mcp.servers.shopify.command "npx"
hermes -p storeops config set mcp.servers.shopify.args '["@shopify/shopify-mcp@latest"]'

hermes -p marketing config set mcp.servers.shopify.command "npx"
hermes -p marketing config set mcp.servers.shopify.args '["@shopify/shopify-mcp@latest"]'

hermes -p customer-brand config set mcp.servers.shopify.command "npx"
hermes -p customer-brand config set mcp.servers.shopify.args '["@shopify/shopify-mcp@latest"]'

# Test gateway
hermes -p brain gateway &
curl http://localhost:8642/health
```

---

## Time Budget Cheat Sheet

If you're behind schedule, cut in this order:
1. **Voice input** — demo with text, mention voice works
2. **Image upload agent** — two agents still impress
3. **Landing page builder** — dashboard + agents carry the demo
4. **Review manager** — support + copywriter are enough
5. **Mock dashboard cards** — real data cards are the priority

**Never cut:** Chat streaming, Product Lister, Dashboard, Deployed URL, Backup video.
