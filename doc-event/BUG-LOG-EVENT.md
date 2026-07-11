# 🐛 GrowthX Hermes Buildathon — Bug Log

> **Project:** HermesStore
> **Purpose:** Track bugs, fixes, and lessons learned during the 8-hour build.
> **Convention:** Fix fast, log always. Every bug teaches something.

---

## Bug Tracker

| ID | Title | Severity | Phase | Status | Time to Fix |
|----|-------|----------|-------|--------|-------------|
| #001 | API_SERVER_KEY too short (<16 chars) | High | Pre-Event | ✅ Fixed | 2 min |

---

## Bug #001 — API_SERVER_KEY Too Short

| Field | Details |
|---|---|
| **Severity** | High |
| **Phase found** | Pre-Event (testing) |
| **Description** | Hermes gateway starts but API server refuses: "Refusing to start: API_SERVER_KEY is a placeholder or too short (<16 chars)" |
| **Steps to reproduce** | 1. Set `API_SERVER_KEY=hermesstore-dev` (15 chars) 2. Run `hermes gateway` 3. Check logs |
| **Expected** | API server starts on port 8642 |
| **Actual** | API server skipped, gateway runs without it |
| **Fix** | Use 16+ char key: `API_SERVER_KEY=hermesstore-dev-2026` or `openssl rand -hex 32` |
| **Time to fix** | 2 minutes |
| **Lesson** | Always check gateway logs (`hermes gateway 2>&1`). API key must be 16+ chars. Test with `curl http://localhost:8642/health` |
| BUG-001 | SSE stream drops first token | Medium | 1 | 25 min |
| BUG-002 | Shopify MCP returns 401 after profile switch | High | 2 | 15 min |
| BUG-003 | Dashboard metrics show stale data | Low | 5 | 10 min |

---

### BUG-001: SSE stream drops first token

| Field | Details |
|-------|---------|
| **Severity** | Medium |
| **Phase found** | Phase 1 — Foundation |
| **Description** | When the frontend connects to the SSE endpoint, the very first token of the response is missing. Subsequent tokens stream correctly. |
| **Steps to reproduce** | 1. Open chat UI 2. Type "Hello" 3. Observe streamed response 4. Compare with raw API output — first word is cut off |
| **Expected** | Full streamed response starting from the first token |
| **Actual** | First token is lost; response appears to start mid-word |
| **Fix applied** | The API route was calling `res.write()` before setting the correct `Content-Type: text/event-stream` header. Moved header setup above the first write. Also added a flush after the initial `data: ` prefix. |
| **Time to fix** | 25 min |
| **Lesson learned** | Always set SSE headers before any writes. Test with `curl -N` before wiring up the frontend — isolates backend issues from UI issues. |

---

### BUG-002: Shopify MCP returns 401 after profile switch

| Field | Details |
|-------|---------|
| **Severity** | High |
| **Phase found** | Phase 2 — Core Store Ops |
| **Description** | After creating the `ecommerce-store` Hermes profile and configuring the Shopify MCP server, all Shopify API calls return 401 Unauthorized. The default profile's credentials were not inherited. |
| **Steps to reproduce** | 1. Create new Hermes profile `ecommerce-store` 2. Configure Shopify MCP in the profile 3. Ask the agent to list products 4. Agent reports 401 error |
| **Expected** | MCP server uses the Shopify API key configured in the profile |
| **Actual** | 401 Unauthorized — the env vars were not set in the new profile's config |
| **Fix applied** | Copied the `[env]` section from the default profile's MCP config into the `ecommerce-store` profile's `config.yaml`. Verified with `hermes config show`. |
| **Time to fix** | 15 min |
| **Lesson learned** | Hermes profiles are isolated sandboxes. Environment variables, MCP configs, and API keys do NOT cascade from the default profile. Always duplicate env blocks when creating new profiles. |

---

### BUG-003: Dashboard metrics show stale data

| Field | Details |
|-------|---------|
| **Severity** | Low |
| **Phase found** | Phase 5 — Polish |
| **Description** | Dashboard metrics (order count, revenue) show data from the initial page load but don't update when new products are created or orders come in. |
| **Steps to reproduce** | 1. Load dashboard (shows N products) 2. Create a new product via chat 3. Return to dashboard 4. Product count is still N |
| **Expected** | Metrics refresh when the user navigates back or a new action occurs |
| **Actual** | Metrics are static until a full page refresh (F5) |
| **Fix applied** | Added `router.refresh()` on dashboard tab focus using Next.js `usePathname` + `useEffect`. Also added Convex `useQuery` subscription so real-time changes push to the UI. |
| **Time to fix** | 10 min |
| **Lesson learned** | In Next.js App Router, `useRouter().refresh()` re-fetches server components. For real-time, Convex subscriptions are the right tool — don't rely on client-side state for data that changes server-side. |

---

## Common Bug Patterns to Watch For

> Pre-filled pitfalls from past buildathons. Check here first when something breaks.

| # | Symptom | Likely Cause | Quick Fix |
|---|---------|-------------|-----------|
| 1 | "Module not found" after `npm install` | Lockfile mismatch / wrong Node version | Delete `node_modules` + `package-lock.json`, reinstall |
| 2 | Blank page after deploy to Cloudflare | Missing `output: 'export'` in `next.config.js` or env vars not set in CF dashboard | Check build output, add env vars in Cloudflare Pages settings |
| 3 | MCP tool calls fail silently | Agent doesn't know the tool exists — MCP server not in profile config | Run `hermes tools` to verify the tool appears; check `config.yaml` |
| 4 | Voice input garbled or cut off | Wispr Flow microphone permission denied / noise cancellation issue | Check OS mic permissions; test in Wispr's own UI first |
| 5 | Convex functions timeout | Free tier cold start (~2s) + large query | Add loading state; paginate queries; consider `useQuery` with pagination |
| 6 | SSE connection drops after 60s | Cloudflare free tier has a 100s timeout; some proxies have 60s | Add heartbeat comments every 15s: `res.write(': keepalive\n\n')` |
| 7 | Shopify API rate limit (429) | Too many product creation calls in quick succession | Add 500ms delay between bulk operations; cache reads |

---

## Challenges & Solutions

> Non-bug issues encountered during the build. Integration gotchas, performance problems, design decisions, and workarounds.

### Challenge 1: Shopify MCP Server Auth Flow

**Problem:** The Shopify MCP server requires an OAuth flow that can't complete in a headless environment. The buildathon laptop needs to authenticate in a browser, but the MCP server starts in the terminal.

**Solution:** Pre-authenticate the Shopify app during Phase 0 setup. Complete the OAuth flow once in a browser, copy the resulting access token, and hardcode it in the profile's env vars. The MCP server will use the token directly without needing the OAuth redirect.

**Time spent:** 15 min (pre-event setup)

---

### Challenge 2: Convex Real-Time + Next.js Hydration Mismatch

**Problem:** Convex `useQuery` returns data client-side, but Next.js server components also try to render the same data on the server. This causes a hydration mismatch warning and sometimes a flash of empty content.

**Solution:** Wrap Convex-dependent components in `'use client'` boundary. Use `Suspense` with a skeleton fallback. Don't try to server-render Convex data — let the client subscription handle it.

**Time spent:** 20 min

---

### Challenge 3: Voice → Agent Pipeline Latency

**Problem:** The full pipeline — Wispr Flow speech-to-text → API route → Hermes agent → response — adds 3–5 seconds of latency. Feels sluggish on stage.

**Solution:** Show immediate visual feedback: "Listening..." → "Transcribing..." → "Agent thinking..." → response. The UX perception of speed improves dramatically with micro-interactions, even if the actual latency doesn't change. Also pre-warm the Hermes agent by sending a dummy request at app startup.

**Time spent:** 10 min

---

### Challenge 4: Cloudflare Pages + Next.js Image Optimization

**Problem:** `next/image` uses the default Node.js image optimizer, which doesn't work on Cloudflare Pages (no Node.js runtime at the edge). Build fails with an error about `sharp`.

**Solution:** Switch to `@cloudflare/next-on-pages` or set `images: { unoptimized: true }` in `next.config.js` for the buildathon. Product images will serve at full size — acceptable for a demo, not for production.

**Time spent:** 10 min

---

### Challenge 5: Demo Day WiFi Reliability

**Problem:** Venue WiFi is shared with 100+ attendees. API calls to Shopify/Convex/Hermes may timeout.

**Solution:** Have the backup video ready at all times. Also, pre-cache as much data as possible: load the dashboard once before the demo starts, keep the dev server running (not just deployed), and have a mobile hotspot as fallback.

**Time spent:** 0 min (just preparation)

---

## Severity Definitions

| Severity | Definition | Action |
|----------|-----------|--------|
| **Critical** | Blocks core demo flow. App crashes or key feature non-functional. | Fix immediately. Drop everything. |
| **High** | Feature broken but workaround exists. Degraded demo experience. | Fix within 15 min. If stuck, use workaround and log. |
| **Medium** | Cosmetic or secondary feature issue. Demo can proceed. | Fix if time permits. Log and move on. |
| **Low** | Minor annoyance. No impact on demo. | Note it. Fix in polish phase or post-event. |

---

## Post-Event Review

> Fill this in after the buildathon.

| Metric | Value |
|--------|-------|
| Total bugs found | _fill in_ |
| Critical bugs | _fill in_ |
| Total time spent fixing bugs | _fill in_ |
| Biggest time sink | _fill in_ |
| Top 3 lessons learned | _fill in_ |
| What to pre-prepare next time | _fill in_ |
