# HermesStore — Event Build

> **GrowthX Hermes Buildathon — July 12, Pune**
> **Track:** Revenue (show real money flow)
> **Goal:** Working demo with real ₹9 sales in 8 hours

## What This Is

AI-powered ecommerce store manager. One chat interface manages everything — products, pricing, marketing, support, payments.

**Built on:** Hermes Agent (4 profiles, 15 agents, Shopify MCP)

## Quick Start (Tomorrow at Event)

```bash
# 1. Create profiles
hermes profile create hermesstore-brain
hermes profile create hermesstore-storeops
hermes profile create hermesstore-marketing
hermes profile create hermesstore-customer-brand

# 2. Configure each (see ROADMAP-EVENT.md for details)

# 3. Start gateways
hermes -p hermesstore-brain gateway        # Port 8642
hermes -p hermesstore-storeops gateway     # Port 8643
hermes -p hermesstore-marketing gateway    # Port 8644
hermes -p hermesstore-customer-brand gateway # Port 8645

# 4. Start frontend
cd frontend && npm run dev                 # Port 3000

# 5. Open http://localhost:3000
```

## Architecture (Hackathon)

```
Frontend (Next.js) → Brain (8642) → Store Ops (8643)
                                   → Marketing (8644)
                                   → Customer/Brand (8645)
```

## Event Documentation

| Document | Purpose |
|---|---|
| [ROADMAP-EVENT.md](./ROADMAP-EVENT.md) | Hour-by-hour build plan |
| [CHECKLIST-EVENT.md](./CHECKLIST-EVENT.md) | Progress tracking |
| [ARCHITECTURE-EVENT.md](./ARCHITECTURE-EVENT.md) | 4-profile architecture |
| [AGENTS-V1-EVENT.md](./AGENTS-V1-EVENT.md) | 15 agents spec |
| [BUG-LOG-EVENT.md](./BUG-LOG-EVENT.md) | Bug tracking |
| [OPEN-SOURCE-SOURCES-EVENT.md](./OPEN-SOURCE-SOURCES-EVENT.md) | Repos used |
| [USER-WORKFLOW-EVENT.md](./USER-WORKFLOW-EVENT.md) | User journeys |
| [SITEMAP-EVENT.md](./SITEMAP-EVENT.md) | Page structure |

## Full Documentation (Post-Event)

| Document | Purpose |
|---|---|
| [HermesStore-Project-Document.md](./HermesStore-Project-Document.md) | Master doc (1600+ lines) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full 8-profile architecture |
| [AGENTS-V1.md](./AGENTS-V1.md) | All 32 agents spec |
| [ROADMAP.md](./ROADMAP.md) | Full roadmap |

## Tech Stack

| Layer | Technology |
|---|---|
| AI | Hermes Agent + OpenAI GPT-5.5 |
| Store | Shopify MCP (75 tools) |
| Database | Convex (real-time) |
| Hosting | Cloudflare |
| Payments | Dodo Payments |
| Voice | ElevenLabs + Wispr Flow |
| Intel | Linkup |

## License

MIT — Built at GrowthX Hermes Buildathon, July 2026
