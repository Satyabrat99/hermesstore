# HermesStore — Session Context (context_init.md)

> Living context file. If this session is lost, read this + `CONTEXT.md` to resume exactly where we left off.

## What we're building
AI-powered ecommerce store manager. One chat interface controls an entire Shopify store (products, pricing, marketing, support, payments).
- **Hackathon:** GrowthX Hermes Buildathon, Pune, July 12. Hard goal: a **real ₹9 sale** in 8 hours.
- **Frontend:** Next.js thin client → Hermes Agent built-in API server (`http://localhost:8642/v1/chat/completions`, OpenAI-compatible, SSE streaming). **No custom backend, no API routes.**

## Architecture
- **brain** profile (:8642) = router/orchestrator. Frontend only talks to brain.
- brain routes by intent → **storeops** (:8643), **marketing** (:8644), **customer-brand** (:8645).
- 15 agents across 4 profiles. All use **Shopify MCP** (75 tools).
- Mocked "coming soon" departments (Fulfillment, Finance, Analytics) shown as cards.

## Established workflow (this session)
- **Plan + build in chunks** — see "Planning skill" note below.
- **Bug hunting** — `bug-hunter` skill (available ✓).
- **Code quality** — see "Code quality skill" note below.
- **Git commits per change** — commit after each completed chunk, co-author `CommandCodeBot`.
- **This file** — updated with every development so a lost session can resume.

## Build plan (chunks / prompts)
1. **PROMPT-1:** Scaffold Next.js 15 + chat interface (`frontend/`) ← NEXT
2. Dashboard (`/`)
3. Products (`/products` + `/products/add` wizard)
4. Marketing (`/marketing` + `/marketing/social`)
5. Agents (`/agents`)
6. Polish + deploy (Cloudflare)

## Status
- [x] PROMPT-1 scaffold — DONE (2026-07-11). Production build passes. Dev server has CSS issue (see known issues).
- [x] PROMPT-2 dashboard — DONE (2026-07-11). MetricCards, AgentActivity, AlertsPanel, QuickActions. Build passes.
- [x] PROMPT-3 products — DONE (2026-07-11). ProductCard, products grid, search, filters, sidebar nav. Build passes.
- [x] PROMPT-4 add product — DONE (2026-07-11). /products/add with text/image/voice input, AI generate, publish flow. Build passes.
- [x] PROMPT-5 marketing — DONE (2026-07-11). Campaigns, social posts, AI suggestions. Build passes.
- [x] PROMPT-6 agents — DONE (2026-07-11). 9 agents, department filter, activity log. Build passes.
- [ ] Products
- [ ] Marketing
- [ ] Agents
- [ ] Polish + deploy

## Key references
- `CONTEXT.md` — project context
- `doc_init/` — full planning docs (8-profile / 32-agent vision)
- `doc-event/` — simplified event docs (4-profile / 15-agent, what we build)
- `prompts/PROMPT-1-scaffold-frontend.md` — ready-to-run scaffold task
- `skills/` — currently EMPTY (Hermes skill markdown files not yet written)
- `frontend/` — EMPTY except stub package.json

## Open decisions
- **Planning:** RESOLVED — use plan mode per chunk (user referenced "agentskills" skill; not in available set, so use plan mode).
- **Code quality:** RESOLVED — standard quality gates (user referenced "ponytail" skill; not in available set).
- **bug-hunter:** available ✓, will use for bug finding/fixing.
dev` which skips devDependencies during install. A local `.npmrc` with `omit=` overrides it (npm warns it's invalid but it works).
- **npm phantom satisfied:** npm refuses to reify `tailwindcss`/`@tailwindcss/postcss` even when properly configured. Worked around via `.npmrc` override.

## Open decisions
- **Planning:** RESOLVED — use plan mode per chunk (user referenced "agentskills" skill; not in available set, so use plan mode).
- **Code quality:** RESOLVED — standard quality gates (user referenced "ponytail" skill; not in available set).
- **bug-hunter:** available ✓, will use for bug finding/fixing.
