# Open-Source Sources — HermesStore Component Extraction Plan

> **Purpose**: Catalog every open-source project we plan to use, with EXACT components to extract and skip.
> **License**: All 7 repos are **MIT** — permissive for commercial use, modification, and redistribution.
> **Last updated**: 2026-07-11

---

## Summary Table

| # | Repo | Stars | License | Integration Method | Effort |
|---|------|-------|---------|-------------------|--------|
| 1 | agno-agi/agent-ui | 1,796 | MIT | Copy + Adapt | 2–3 days |
| 2 | dainostore/shopify-ai-skills | 5 | MIT | Convert Format | 1–2 days |
| 3 | thearnavrustagi/marketmenow | 125 | MIT | Extract Patterns | 2–3 days |
| 4 | mutonby/skill-autoecom | 14 | MIT | Copy (Hermes-native) | 0.5 days |
| 5 | sanbhaumik/dynamic-pricing-agent | 1 | MIT | Extract + Reimplement | 2–3 days |
| 6 | inbharatai/SocialFlow | 19 | MIT | Extract Patterns | 2–3 days |
| 7 | Avant-Garde-AI/marketing-os | 0 | MIT | Extract Templates | 1–2 days |

**Total estimated effort**: 11–17 days

---

## Architecture Impact — Hermes API Server Eliminates Custom Backend

> **Key insight**: Because Hermes Agent already includes a full API server (chat, streaming, sessions, approvals, cron jobs, skills, toolsets), **HermesStore is a thin frontend client** — not a full-stack app. This dramatically simplifies what we need from each open-source repo.

### What Hermes API Server Handles (built-in — we build NONE of this)

| Capability | Hermes Built-In | What We'd Have Built Without It |
|-----------|----------------|-------------------------------|
| Chat + Streaming | ✅ `POST /chat`, SSE streaming | Custom WebSocket server, message queue |
| Sessions + Memory | ✅ SQLite-backed session store | PostgreSQL + ORM + migrations |
| Approvals / HITL | ✅ Approval gates in skill execution | Custom approval workflow engine |
| Cron / Scheduling | ✅ `hermes cron` built-in | APScheduler / Celery + Redis |
| Skills + Toolsets | ✅ `SKILL.md` format, toolset registry | Plugin system, dynamic loader |
| Auth | ✅ API key + profile-based | JWT + OAuth flow |

### How This Changes What We Extract From Each Repo

| Repo | Previous Plan | Updated Plan |
|------|--------------|-------------|
| **agno-agi/agent-ui** | Take UI components AND study their API layer for our backend | **UI components only** — SKIP their `os.ts` API layer entirely. We connect directly to Hermes API Server. |
| **dainostore/shopify-ai-skills** | Convert skills to work with our custom backend | Skills go straight into Hermes `skills/` — no backend adapter needed. |
| **marketmenow** | Study adapter patterns for both frontend + backend integration | Adapter patterns are for **platform connections** (social media, marketplaces) — not for backend architecture. |
| **skill-autoecom** | Already Hermes-native | **No change** — was already designed for this architecture. |
| **dynamic-pricing-agent** | Extract backend FastAPI + decision logic | Extract **decision logic only** (decision.py, serp.py). Skip entire FastAPI server — Hermes skills handle API exposure. |
| **SocialFlow** | Extract 6-agent pipeline + backend adapters | Pipeline pattern maps 1:1 to Hermes subagent orchestration. No custom backend needed. |
| **marketing-os** | Extract spec templates + Mastra patterns | Spec templates only. Mastra's agent runtime is irrelevant — Hermes is our runtime. |

### Net Result
- **~40% less extraction work** — we skip all backend/server code from every repo
- **No custom backend to maintain** — Hermes API Server is the backend
- **Faster integration** — frontend wires directly to `localhost:4444` (Hermes API)
- **Single deployment model** — Hermes Agent runs everything; HermesStore is just a UI shell

---

## 1. agno-agi/agent-ui

**URL**: https://github.com/agno-agi/agent-ui
**Stars**: 1,796 | **Forks**: 369 | **License**: MIT
**Language**: TypeScript (99.4%) | **Framework**: Next.js + Tailwind CSS + shadcn/ui

### Clone Command
```bash
git clone https://github.com/agno-agi/agent-ui.git ~/repos/agent-ui
```

### Components to TAKE

| Component | Files | Purpose |
|-----------|-------|---------|
| **ChatArea** | `ChatArea.tsx`, `MessageItem.tsx`, `Messages.tsx`, `ChatInput.tsx` | Core chat interface — streaming messages, input box, message rendering |
| **Sidebar** | `Sidebar.tsx`, `SessionItem.tsx` | Session list, conversation switching, endpoint config |
| **UI Primitives** | `button.tsx`, `dialog.tsx`, `icon/` directory | shadcn/ui components — buttons, modals, icon system |
| **Styling** | `globals.css`, `tailwind.config.ts` | Design tokens, color palette, typography, dark theme |
| **Tool Calls UI** | Tool call visualization components | Display agent tool invocations and results |
| **Reasoning Steps** | Reasoning display components | Show agent chain-of-thought (when available) |
| **References** | Source/reference display components | Citations and source links |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| `os.ts` (API layer) | Tightly coupled to Agno AgentOS — we replace with our own Hermes gateway API |
| `routes.ts` | Agno-specific routing — we use our own Next.js API routes |
| AgentOS connection logic | We connect to Hermes backend, not Agno |
| Auth token handling | We implement our own auth flow |

### Integration Method: **Copy + Adapt**
1. Copy component files into `hermesstore/ui/components/chat/`
2. Strip Agno-specific imports and API calls
3. Replace data fetching with our Hermes gateway hooks
4. Adapt TypeScript types to our message/agent schema
5. Keep styling and animation patterns intact

### Effort Estimate: **2–3 days**
- Day 1: Copy + strip Agno dependencies
- Day 2: Wire up to our API layer + adapt types
- Day 3: Polish, test streaming, fix edge cases

---

## 2. dainostore/shopify-ai-skills

**URL**: https://github.com/dainostore/shopify-ai-skills
**Stars**: 5 | **Forks**: 2 | **License**: MIT
**Language**: JavaScript | **Format**: Claude Code skill markdown files

### Clone Command
```bash
git clone https://github.com/dainostore/shopify-ai-skills.git ~/repos/shopify-ai-skills
```

### Components to TAKE — All 15 Skill Files

| Skill | File | Pillar | Hermes Conversion Notes |
|-------|------|--------|------------------------|
| **product-research** | `product-research.md` | Product Intelligence | Add Hermes SKILL.md frontmatter, replace `/command` with skill trigger |
| **product-launcher** | `product-launcher.md` | Product Intelligence | Convert Shopify API calls to Hermes tool patterns |
| **competitor-spy** | `competitor-spy.md` | Product Intelligence | Adapt scoring rubrics for Hermes agent execution |
| **margin-analyzer** | `margin-analyzer.md` | Pricing & Margins | Map Shopify inventory API to Hermes data tools |
| **pricing-optimizer** | `pricing-optimizer.md` | Pricing & Margins | Combine with dynamic-pricing-agent patterns |
| **bulk-price-update** | `bulk-price-update.md` | Pricing & Margins | Add safety rails as Hermes approval gates |
| **order-autopilot** | `order-autopilot.md` | Order & Fulfillment | Convert to Hermes cron-scheduled skill |
| **refund-handler** | `refund-handler.md` | Order & Fulfillment | Add human-in-the-loop approval step |
| **supplier-scorecard** | `supplier-scorecard.md` | Order & Fulfillment | Adapt scoring framework for Hermes output |
| **store-health-check** | `store-health-check.md` | Store Analytics | Convert to Hermes dashboard skill |
| **sales-dashboard** | `sales-dashboard.md` | Store Analytics | Map to Hermes reporting pattern |
| **customer-segments** | `customer-segments.md` | Store Analytics | RFM segmentation — adapt output format |
| **marketing-copy** | `marketing-copy.md` | Marketing & Content | Convert to Hermes content generation skill |
| **campaign-builder** | `campaign-builder.md` | Marketing & Content | Add Hermes scheduling integration |
| **content-engine** | `content-engine.md` | Marketing & Content | Multi-channel — map to platform adapters |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| Claude Code CLI integration (`/command` syntax) | We use Hermes skill format instead |
| `.claude/commands/` directory structure | Replace with Hermes `skills/` directory |
| Claude-specific prompt patterns | Rewrite for Hermes agent execution |

### Conversion Process (Claude Code → Hermes)
```markdown
# BEFORE (Claude Code format):
# .claude/commands/product-research.md
You are a Shopify product researcher...

# AFTER (Hermes format):
# skills/shopify-product-research/SKILL.md
---
name: shopify-product-research
description: Discover and validate product opportunities using market signals
triggers:
  - "research products"
  - "find winning products"
---
You are a Shopify product researcher...
```

### Effort Estimate: **1–2 days**
- Day 1: Clone, read all 15 skills, convert format + frontmatter
- Day 2: Test each skill in Hermes, adjust prompts, verify Shopify API patterns

---

## 3. thearnavrustagi/marketmenow

**URL**: https://github.com/thearnavrustagi/marketmenow
**Stars**: 125 | **Forks**: 36 | **License**: MIT
**Language**: Python (88.8%) | **Architecture**: Ports-and-adapters

### Clone Command
```bash
git clone https://github.com/thearnavrustagi/marketmenow.git ~/repos/marketmenow
```

### Components to TAKE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Platform Adapter Pattern** | `src/adapters/` directory | Ports-and-adapters architecture — `PlatformAdapter`, `ContentRenderer`, `Uploader` protocols |
| **AdapterRegistry** | Core registry pattern | Register new platforms with zero core changes |
| **Content Capsule Concept** | `src/core/capsule/` | Self-contained content packages — cross-post to any platform without re-generation |
| **Brand Template YAML** | `projects/*/` + `prompts/` | YAML-based brand identity: colors, fonts, voice, persona, targets |
| **Engagement Automation** | `src/adapters/twitter/engage.py`, `src/adapters/reddit/engage.py` | Find relevant conversations, write contextual replies, human-like timing |
| **Pipeline Architecture** | `src/core/pipeline.py` | Normalise → Render → Sanitise → Upload → Publish |
| **Text Sanitiser** | Core sanitisation layer | Strip AI-telltale formatting (em-dashes, en-dashes) before publish |
| **Persona YAML** | `personas/default.yaml` | Voice, tone, example phrases — decomposed from function templates |
| **Cross-Platform Repurposing** | `repurpose-capsule` workflow | LLM-powered format-aware transformations between platforms |
| **In-Context Learning** | ICL module | Epsilon-greedy embedding sampling for diverse example selection |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| CLI (`mmn` commands) | We integrate via Hermes skills, not standalone CLI |
| Web dashboard (`mmn-web`) | We build our own HermesStore dashboard |
| PostgreSQL dependency | We use Hermes state management |
| Docker compose setup | Hermes handles deployment |
| Playwright browser automation | We use our own browser tools or platform APIs |

### Integration Method: **Extract Patterns + Reimplement**
1. Study the adapter protocol interfaces (`PlatformAdapter`, `ContentRenderer`, `Uploader`)
2. Implement compatible protocols in our HermesStore adapter layer
3. Port the brand template YAML schema
4. Adapt the content capsule data model
5. Reimplement engagement automation logic as Hermes skills

### Effort Estimate: **2–3 days**
- Day 1: Study architecture, extract protocol interfaces + YAML schemas
- Day 2: Implement adapter registry + content capsule in our codebase
- Day 3: Port engagement logic + test with 2–3 platforms

---

## 4. mutonby/skill-autoecom

**URL**: https://github.com/mutonby/skill-autoecom
**Stars**: 14 | **Forks**: 3 | **License**: MIT
**Language**: Python | **Status**: Already Hermes-native ✅

### Clone Command
```bash
git clone https://github.com/mutonby/skill-autoecom.git ~/repos/skill-autoecom
```

### Components to TAKE — Everything

| Component | File | Purpose |
|-----------|------|---------|
| **SKILL.md** | `SKILL.md` | Complete skill definition — already Hermes-compatible with frontmatter, triggers, steps |
| **autoecom.py** | `autoecom.py` | Python glue script — API calls, image compositing, state persistence |
| **Brand Kit Extraction** | Embedded in SKILL.md | Multimodal vision → logo, palette, font, voice identification |
| **Round-Robin Product Selection** | `state/processed.json` | Daily carousel pipeline — picks next unprocessed bestseller |
| **Slide Generation** | `autoecom.py generate` | nano-banana (Gemini 2.5 Flash Image) → stylized product slides |
| **Pillow Compositing** | `autoecom.py compose` | Text overlay, logo placement, gradient backgrounds |
| **Learning System** | `autoecom.py learn` | Weekly z-score analysis → refresh HOT_HOOKS.md + HOT_IMAGERY.md |
| **Upload-Post Integration** | `autoecom.py publish` | Multipart POST → Instagram carousel + TikTok draft |
| **TikTok Draft Mode** | Publish workflow | Intentional — trending sounds can only be added in-app |
| **Cron Schedule** | SKILL.md install instructions | Daily 09:00 generate + Weekly Monday 09:00 learn |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| Nothing — this is fully Hermes-native | Take everything as-is |

### Integration Method: **Direct Copy**
1. Clone repo into `~/Documents/skill-autoecom` (or HermesStore skills directory)
2. Create venv, install requirements.txt
3. Copy `.env.example` → `.env`, fill in keys
4. Schedule two Hermes cron jobs (daily + weekly)

### Effort Estimate: **0.5 days**
- Copy, configure `.env`, test one carousel generation, verify cron scheduling

---

## 5. sanbhaumik/dynamic-pricing-agent

**URL**: https://github.com/sanbhaumik/dynamic-pricing-agent
**Stars**: 1 | **Forks**: 0 | **License**: MIT
**Language**: Python (FastAPI) + JavaScript (React)

### Clone Command
```bash
git clone https://github.com/sanbhaumik/dynamic-pricing-agent.git ~/repos/dynamic-pricing-agent
```

### Components to TAKE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Margin Floor Enforcement** | `backend/agent/decision.py` | Server-side hard floor — Claude never recommends below margin_floor. Dual enforcement: prompt + code clamp |
| **Flash Sale Detection** | `backend/agent/decision.py` | Detects >20% price drops → auto-HOLD, expect reversal in ~6 hours |
| **Pricing Decision Framework** | `backend/agent/decision.py` | Three-action model: REPRICE (84% confidence) / HOLD (91%) / ESCALATE (38%) |
| **Confidence Scoring** | Claude integration | Each decision includes confidence % — low confidence → escalate to human |
| **Config Schema** | `backend/config.yaml` | Product definition: name, SKU, search_query, current_price, margin_floor, target_position, markets, currency |
| **SERP Integration** | `backend/agent/serp.py` | Bright Data SERP API client — Google Shopping competitor prices by country |
| **Amazon Buy Box Monitor** | `backend/agent/amazon.py` | Bright Data eCommerce Scraper — Buy Box ownership, seller count, lowest price |
| **Decision Memory** | `backend/agent/memory.py` | In-memory price + decision history storage |
| **Demo Scenarios** | `backend/agent/demo_data.py` | Three pre-baked scenarios (reprice/hold/escalate) for testing |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| `frontend/` (entire directory) | React frontend — we build our own HermesStore dashboard |
| `frontend/src/components/*` | DecisionPanel, MarketPanel, BuyBoxPanel, PriceChart — we redesign |
| Vite config + frontend dependencies | Not needed |

### Integration Method: **Extract Logic + Reimplement Frontend**
1. Copy `backend/agent/` directory (decision.py, serp.py, amazon.py, memory.py)
2. Port the decision framework to a Hermes skill
3. Extract config.yaml schema for product definitions
4. Build our own dashboard UI using agent-ui components (from repo #1)
5. Replace Bright Data with our own data sources if needed

### Effort Estimate: **2–3 days**
- Day 1: Extract backend agent logic, understand decision framework
- Day 2: Port to Hermes skill format, wire up config schema
- Day 3: Integrate with our dashboard, test all three decision types

---

## 6. inbharatai/SocialFlow

**URL**: https://github.com/inbharatai/SocialFlow
**Stars**: 19 | **Forks**: 3 | **License**: MIT
**Language**: Python (68%) + HTML (31.6%)

### Clone Command
```bash
git clone https://github.com/inbharatai/SocialFlow.git ~/repos/SocialFlow
```

### Components to TAKE

| Component | Location | Purpose |
|-----------|----------|---------|
| **6-Agent Pipeline Pattern** | Architecture design | Scout → Planner → Creator → Reviewer → Publisher → Analyst |
| **Agent Definitions** | `backend/agents/` | Each agent's role, schedule, inputs, outputs |
| **Brand Kit YAML Structure** | `backend/brand/` | Colors (primary, secondary, dark, accents), logo, typography, tone, forbidden styles, hashtags, CTAs, products |
| **Approval Gate Logic** | `backend/reviewer/` | Credential safety checks, brand voice validation, claim verification before publish |
| **12-Platform Adapter List** | `backend/adapters/` | LinkedIn, X/Twitter, Facebook, Instagram, Discord, Reddit, Medium, Substack, HeyGen, beehiiv, MailerLite, Brevo |
| **Platform Auth Patterns** | `backend/accounts/` | Playwright session persist, webhook URLs, OAuth credentials, API keys |
| **Scout Intelligence** | `backend/scout/` | HN + RSS news fetching, GitHub repo scanning, trend detection |
| **Schedule Configuration** | `backend/scheduler/` | 8 AM / 2 PM / 8 PM scout runs, 11 AM / 11 PM publish windows |
| **Image Generation Pipeline** | `backend/images/` | GPT Image 1.5 integration, brand-aware generation, platform-optimized sizes |
| **Analytics Loop** | `backend/analyst/` | Performance tracking, daily/weekly reports, feed insights back to pipeline |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| FastAPI server (`main.py`) | We use our own Hermes gateway |
| React dashboard (single HTML) | We build our own with agent-ui components |
| SQLite database layer | We use Hermes state management |
| Playwright browser automation | We use platform APIs or Hermes browser tools |
| Ollama local AI setup | We use our own model routing |

### Integration Method: **Extract Patterns + Reimplement**
1. Study the 6-agent pipeline architecture
2. Implement each agent as a Hermes skill or subagent
3. Port brand kit YAML schema
4. Extract approval gate logic as reusable validation functions
5. Map the 12-platform list to our adapter registry (from repo #3)

### Effort Estimate: **2–3 days**
- Day 1: Study pipeline architecture, extract agent definitions + brand kit schema
- Day 2: Implement Scout + Planner + Creator as Hermes skills
- Day 3: Implement Reviewer (approval gates) + Publisher + Analyst, test end-to-end

---

## 7. Avant-Garde-AI/marketing-os

**URL**: https://github.com/Avant-Garde-AI/marketing-os
**Stars**: 0 | **Forks**: 0 | **License**: MIT
**Language**: TypeScript + JavaScript | **Framework**: Mastra + Next.js

### Clone Command
```bash
git clone https://github.com/Avant-Garde-AI/marketing-os.git ~/repos/marketing-os
```

### Components to TAKE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Skills System Architecture** | `spec/05-AGENTS-AND-SKILLS.md` | Skill definition format, execution model, community contribution pattern |
| **Spec Document Templates** | `spec/01-PRD.md` through `spec/10-IMPLEMENTATION-PLAN.md` | 10 spec files — PRD, Architecture, CLI Spec, Scaffold Spec, Agents & Skills, UI Spec, Deployment, Community, Repo Structure, Implementation Plan |
| **Async PR Pipeline Concept** | `/.github/workflows/` + spec | GitHub Actions + Claude Code → PRs for storefront changes. Reviewable, reversible, traceable |
| **Two Execution Paths** | Architecture spec | Sync path (real-time chat + read-only skills) vs Async path (git-based, PR-gated changes) |
| **Skill Contribution Format** | `CONTRIBUTING.md` + spec | How community members create and share skills |
| **Starter Skills Templates** | Spec examples | Store Health Check, Ad Copy Generator, Weekly Performance Digest |
| **Repository Structure** | `spec/09-REPOSITORY-STRUCTURE.md` | Monorepo layout: packages/, examples/, spec/ |

### Components to SKIP

| Component | Reason |
|-----------|--------|
| Mastra framework (`src/mastra/`) | We use Hermes as our agent framework |
| Next.js admin console (`/agents`) | We build our own HermesStore dashboard |
| Supabase auth + database | We use our own auth and state management |
| Vercel deployment config | We deploy differently |
| `npx @avant-garde/marketing-os` CLI | We use Hermes CLI + skills |
| assistant-ui + @ai-sdk/react | We use agent-ui components (from repo #1) |

### Integration Method: **Extract Templates + Reimplement**
1. Clone and read all 10 spec documents
2. Adapt spec templates for HermesStore (replace Mastra references with Hermes)
3. Extract the async PR pipeline concept for our git-based workflows
4. Use the skill contribution format as basis for our community skills ecosystem
5. Port starter skill templates to Hermes format

### Effort Estimate: **1–2 days**
- Day 1: Read all specs, extract templates, adapt for HermesStore
- Day 2: Create our own spec documents based on their templates, define contribution guidelines

---

## Integration Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HermesStore Integration Map                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UI Layer (Repo #1: agent-ui)                                    │
│  ├── ChatArea ← ChatArea.tsx, MessageItem.tsx, ChatInput.tsx    │
│  ├── Sidebar ← Sidebar.tsx, SessionItem.tsx                     │
│  └── Primitives ← button.tsx, dialog.tsx, icon/                 │
│                                                                  │
│  Skills Layer (Repos #2, #4, #7)                                │
│  ├── 15 Shopify Skills ← dainostore (converted to Hermes)      │
│  ├── Auto-Ecom Skill ← mutonby (Hermes-native, direct copy)    │
│  └── Spec Templates ← Avant-Garde-AI (adapted for Hermes)      │
│                                                                  │
│  Adapter Layer (Repos #3, #6)                                    │
│  ├── Platform Adapters ← marketmenow (ports-and-adapters)       │
│  ├── Content Capsules ← marketmenow (cross-platform packages)   │
│  ├── 6-Agent Pipeline ← SocialFlow (Scout→Planner→Creator→…)   │
│  └── Brand Kit Schema ← SocialFlow (YAML-based identity)        │
│                                                                  │
│  Pricing Engine (Repo #5)                                        │
│  ├── Decision Framework ← dynamic-pricing-agent                 │
│  ├── Margin Floor Enforcement ← dual prompt + code              │
│  └── Flash Sale Detection ← >20% drop → HOLD                   │
│                                                                  │
│  Pipeline Flow                                                   │
│  Scout → Planner → Creator → Reviewer → Publisher → Analyst     │
│    ↑                                 ↓                           │
│    └──── Analytics Feedback Loop ────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## License Compliance Notes

All 7 repositories are licensed under **MIT License**, which permits:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Requires: Include copyright notice and license in distributions

### Attribution Plan
- Maintain a `THIRD_PARTY_LICENSES.md` file in HermesStore root
- Include original copyright notices for each extracted component
- Link back to source repositories in our documentation
- Each adapted component should retain a comment header referencing the original

---

## Extraction Priority Order

| Phase | Repos | Rationale |
|-------|-------|-----------|
| **Phase 1: Foundation** | #1 (agent-ui), #4 (skill-autoecom) | UI components + one working skill proves the stack |
| **Phase 2: Skills** | #2 (shopify-ai-skills), #7 (marketing-os) | 15 skills + spec templates = content library |
| **Phase 3: Adapters** | #3 (marketmenow), #6 (SocialFlow) | Platform adapters + pipeline pattern = multi-platform |
| **Phase 4: Pricing** | #5 (dynamic-pricing-agent) | Pricing engine — depends on adapter layer being ready |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Repo disappears (DMCA, deletion) | Clone all repos on Day 1, store locally |
| License changes | MIT is irrevocable — once MIT, always MIT for already-downloaded code |
| API breaking changes | Pin to specific commits after cloning |
| Component coupling too tight | Our "SKIP" lists minimize coupling — we take only what we need |
| Skill format incompatibility | Test conversion on 2 skills before converting all 15 |

---

## Local Clone Script

```bash
#!/bin/bash
# Clone all repos for HermesStore extraction
mkdir -p ~/repos/hermesstore-sources && cd ~/repos/hermesstore-sources

git clone https://github.com/agno-agi/agent-ui.git
git clone https://github.com/dainostore/shopify-ai-skills.git
git clone https://github.com/thearnavrustagi/marketmenow.git
git clone https://github.com/mutonby/skill-autoecom.git
git clone https://github.com/sanbhaumik/dynamic-pricing-agent.git
git clone https://github.com/inbharatai/SocialFlow.git
git clone https://github.com/Avant-Garde-AI/marketing-os.git

echo "All 7 repos cloned to ~/repos/hermesstore-sources/"
```

---

*This document is the single source of truth for open-source component extraction. Update as repos evolve or new sources are identified.*
