# Open-Source Sources — HermesStore Hackathon Build

> **Purpose**: Open-source repos we actually use for the 8-hour hackathon. Simplified from the full 7-repo plan.
> **License**: All repos are **MIT** — permissive for commercial use, modification, and redistribution.
> **Last updated**: 2026-07-11

---

## Summary Table

| # | Repo | Stars | License | What We Take | Effort |
|---|------|-------|---------|-------------|--------|
| 1 | agno-agi/agent-ui | 1,796 | MIT | Chat UI components, sidebar, styling | 2–3 hours |
| 2 | dainostore/shopify-ai-skills | 5 | MIT | 4 skill templates (product-listing, pricing-optimizer, marketing-copy, content-engine) | 1–2 hours |
| 3 | mutonby/skill-autoecom | 14 | MIT | Entire Hermes skill (Instagram carousel pipeline) | 30 min |
| 4 | sanbhaumik/dynamic-pricing-agent | 1 | MIT | Margin floor enforcement, pricing decision logic | 2–3 hours |

**Total hackathon effort**: ~6–9 hours

### Skipped for Hackathon (Post-Event)

| Repo | Reason |
|------|--------|
| thearnavrustagi/marketmenow | Social media automation — use simpler approach for demo |
| inbharatai/SocialFlow | 6-agent pipeline — overkill for 8-hour build |
| Avant-Garde-AI/marketing-os | Spec templates — not needed for hackathon |

---

## 1. agno-agi/agent-ui

**URL**: https://github.com/agno-agi/agent-ui
**Stars**: 1,796 | **License**: MIT
**Language**: TypeScript (99.4%) | **Framework**: Next.js + Tailwind CSS + shadcn/ui

### Clone
```bash
git clone https://github.com/agno-agi/agent-ui.git ~/repos/agent-ui
```

### TAKE

| Component | Files | Purpose |
|-----------|-------|---------|
| **ChatArea** | `ChatArea.tsx`, `MessageItem.tsx`, `Messages.tsx`, `ChatInput.tsx` | Core chat interface — streaming messages, input box |
| **Sidebar** | `Sidebar.tsx`, `SessionItem.tsx` | Session list, conversation switching |
| **UI Primitives** | `button.tsx`, `dialog.tsx`, `icon/` | shadcn/ui components |
| **Styling** | `globals.css`, `tailwind.config.ts` | Design tokens, colors, dark theme |
| **Tool Calls UI** | Tool call visualization | Display agent tool invocations |

### SKIP

| Component | Reason |
|-----------|--------|
| `os.ts` (API layer) | Tightly coupled to Agno — we use Hermes API |
| `routes.ts` | Agno-specific routing |
| AgentOS connection logic | We connect to Hermes backend |

### Integration: Copy + Adapt
1. Copy components into `hermesstore/ui/components/chat/`
2. Strip Agno imports and API calls
3. Replace with Hermes gateway hooks
4. Keep styling and animations intact

---

## 2. dainostore/shopify-ai-skills

**URL**: https://github.com/dainostore/shopify-ai-skills
**Stars**: 5 | **License**: MIT
**Language**: JavaScript | **Format**: Claude Code skill markdown files

### Clone
```bash
git clone https://github.com/dainostore/shopify-ai-skills.git ~/repos/shopify-ai-skills
```

### TAKE — 4 Skills as Templates

| Skill | File | Purpose |
|-------|------|---------|
| **product-listing** | `product-research.md` | Product listing generation template |
| **pricing-optimizer** | `pricing-optimizer.md` | Pricing optimization prompts (combine with dynamic-pricing-agent) |
| **marketing-copy** | `marketing-copy.md` | Marketing content generation template |
| **content-engine** | `content-engine.md` | Multi-channel content generation |

### SKIP

| Component | Reason |
|-----------|--------|
| Other 11 skills | Not needed for hackathon demo |
| Claude Code CLI `/command` syntax | Convert to Hermes skill format |
| `.claude/commands/` directory | Use Hermes `skills/` directory |

### Conversion: Claude Code → Hermes
```markdown
# BEFORE (.claude/commands/product-research.md)
You are a Shopify product researcher...

# AFTER (skills/shopify-product-listing/SKILL.md)
---
name: shopify-product-listing
description: Generate optimized product listings from input
triggers:
  - "add product"
  - "create listing"
---
You are a Shopify product researcher...
```

---

## 3. mutonby/skill-autoecom

**URL**: https://github.com/mutonby/skill-autoecom
**Stars**: 14 | **License**: MIT
**Language**: Python | **Status**: Already Hermes-native ✅

### Clone
```bash
git clone https://github.com/mutonby/skill-autoecom.git ~/repos/skill-autoecom
```

### TAKE — Everything

| Component | File | Purpose |
|-----------|------|---------|
| **SKILL.md** | `SKILL.md` | Complete skill definition — already Hermes-compatible |
| **autoecom.py** | `autoecom.py` | API calls, image compositing, state persistence |
| **Brand Kit Extraction** | Embedded in SKILL.md | Vision → logo, palette, font, voice |
| **Slide Generation** | `autoecom.py generate` | Gemini 2.5 Flash Image → stylized product slides |
| **Pillow Compositing** | `autoecom.py compose` | Text overlay, logo placement |
| **Cron Schedule** | SKILL.md | Daily 09:00 generate + Weekly Monday learn |

### Integration: Direct Copy
1. Clone repo
2. Create venv, install requirements.txt
3. Copy `.env.example` → `.env`, fill in keys
4. Schedule Hermes cron jobs

---

## 4. sanbhaumik/dynamic-pricing-agent

**URL**: https://github.com/sanbhaumik/dynamic-pricing-agent
**Stars**: 1 | **License**: MIT
**Language**: Python (FastAPI) + JavaScript (React)

### Clone
```bash
git clone https://github.com/sanbhaumik/dynamic-pricing-agent.git ~/repos/dynamic-pricing-agent
```

### TAKE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Margin Floor Enforcement** | `backend/agent/decision.py` | Hard floor — never recommend below margin_floor |
| **Flash Sale Detection** | `backend/agent/decision.py` | >20% price drops → auto-HOLD |
| **Pricing Decision Framework** | `backend/agent/decision.py` | Three actions: REPRICE / HOLD / ESCALATE |
| **Confidence Scoring** | Claude integration | Low confidence → escalate to human |
| **Config Schema** | `backend/config.yaml` | Product: name, SKU, current_price, margin_floor |
| **SERP Integration** | `backend/agent/serp.py` | Bright Data SERP — competitor prices |
| **Demo Scenarios** | `backend/agent/demo_data.py` | Pre-baked scenarios for testing |

### SKIP

| Component | Reason |
|-----------|--------|
| `frontend/` (entire directory) | We build our own HermesStore UI |
| `frontend/src/components/*` | Redesign with agent-ui components |
| FastAPI server | Hermes skills handle API exposure |

### Integration: Extract Logic Only
1. Copy `backend/agent/` (decision.py, serp.py, memory.py)
2. Port decision framework to Hermes skill
3. Extract config.yaml schema
4. Use demo_data.py for hackathon scenarios

---

## Architecture: Hermes API Server

> **Key insight**: Hermes Agent includes a full API server (chat, streaming, sessions, approvals, cron, skills). **HermesStore is a thin frontend client** — no custom backend needed.

| Capability | Hermes Built-In |
|-----------|----------------|
| Chat + Streaming | `POST /chat`, SSE streaming |
| Sessions + Memory | SQLite-backed store |
| Approvals / HITL | Approval gates in skills |
| Cron / Scheduling | `hermes cron` built-in |
| Skills + Toolsets | `SKILL.md` format |
| Auth | API key + profile-based |

### Net Result
- **No custom backend** — Hermes API Server handles everything
- **Frontend wires to `localhost:4444`** (Hermes API)
- **~40% less extraction work** — skip all server code

---

## License Compliance

All repos are **MIT License**:
- ✅ Commercial use, modification, distribution, private use
- ⚠️ Include copyright notice in distributions

### Attribution
- Maintain `THIRD_PARTY_LICENSES.md` in HermesStore root
- Include original copyright notices for each extracted component
- Link back to source repos in documentation

---

## Clone Script (Hackathon — 4 Repos Only)

```bash
#!/bin/bash
# Clone hackathon repos
mkdir -p ~/repos/hermesstore-sources && cd ~/repos/hermesstore-sources

git clone https://github.com/agno-agi/agent-ui.git
git clone https://github.com/dainostore/shopify-ai-skills.git
git clone https://github.com/mutonby/skill-autoecom.git
git clone https://github.com/sanbhaumik/dynamic-pricing-agent.git

echo "4 hackathon repos cloned to ~/repos/hermesstore-sources/"
```
