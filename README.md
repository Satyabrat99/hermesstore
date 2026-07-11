# HermesStore

> AI-Powered Ecommerce Store Manager — Built on Hermes Agent

**One chat interface. Every store operation. Real revenue.**

HermesStore replaces 10+ tools with a single AI agent that manages your entire ecommerce operation — from product listing to marketing to fulfillment to payments.

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd HermesStore

# 2. Install frontend
cd frontend && npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your API keys

# 4. Start development
npm run dev
```

## Architecture

```
Frontend (Next.js) → API Route → Hermes CLI → MCP Servers
                                  ↓
                            Shopify MCP (75 tools)
                            AgentMemory MCP
                            Custom Skills (20 agents)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui |
| AI Runtime | Hermes Agent + OpenAI GPT-5.5 |
| Database | Convex (real-time) + SQLite (local fallback) |
| Ecommerce | Shopify MCP Server |
| Hosting | Cloudflare Pages + Workers |
| Payments | Dodo Payments / Razorpay |
| Voice | ElevenLabs + Wispr Flow |
| Competitor Intel | Linkup |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [ROADMAP.md](./ROADMAP.md) — Build timeline & phases
- [AGENTS-V1.md](./AGENTS-V1.md) — All 20 agents for V1
- [USER-WORKFLOW.md](./USER-WORKFLOW.md) — User journeys
- [SITEMAP.md](./SITEMAP.md) — Page structure
- [OPEN-SOURCE-SOURCES.md](./OPEN-SOURCE-SOURCES.md) — Open-source repos used
- [HermesStore-Project-Document.md](./HermesStore-Project-Document.md) — Full project doc (1600+ lines)
- [CHECKLIST.md](./CHECKLIST.md) — Progress tracking
- [BUG-LOG.md](./BUG-LOG.md) — Bug tracking & lessons learned

## License

MIT — Built at GrowthX Hermes Buildathon, July 2026
