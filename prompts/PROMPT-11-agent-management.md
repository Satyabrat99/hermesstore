# PROMPT 11: Functional Agent Management Page

> Feed this to Command Code. This makes the Agents page actually functional.

---

In C:\Users\satya\HermesStore\frontend, make the Agents page fully functional: start/stop agents, view activity logs, and edit agent system prompts.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

The app has 4 Hermes agent profiles running on different ports:
- Brain: port 8642 (orchestrator)
- Store Ops: port 8643 (products, pricing, inventory)
- Marketing: port 8644 (social, content, campaigns)
- Customer/Brand: port 8645 (support, brand, copywriting)

Each profile has:
- config.yaml at C:\Users\satya\HermesStore\.hermes-{name}\config.yaml
- SOUL.md at C:\Users\satya\HermesStore\.hermes-{name}\SOUL.md
- .env at C:\Users\satya\HermesStore\.hermes-{name}\.env
- skills/ directory

The Hermes binary is at: C:\Users\satya\HermesStore\hermes-agent\.venv\Scripts\hermes.exe

## What to Build

### 1. Create Next.js API routes for agent management

Create `src/app/api/agents/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const PROJECT_DIR = "C:\\Users\\atya\\HermesStore";
const HERMES_BIN = path.join(PROJECT_DIR, "hermes-agent", ".venv", "Scripts", "hermes.exe");

interface AgentConfig {
  id: string;
  name: string;
  department: string;
  port: number;
  homeDir: string;
  description: string;
}

const AGENTS: AgentConfig[] = [
  { id: "brain", name: "Brain (Orchestrator)", department: "brain", port: 8642, homeDir: ".hermes-brain", description: "Routes requests to departments" },
  { id: "storeops", name: "Store Ops", department: "storeops", port: 8643, homeDir: ".hermes-storeops", description: "Products, pricing, inventory, SEO" },
  { id: "marketing", name: "Marketing", department: "marketing", port: 8644, homeDir: ".hermes-marketing", description: "Social media, content, campaigns" },
  { id: "customer", name: "Customer/Brand", department: "customer-brand", port: 8645, homeDir: ".hermes-customer", description: "Support, brand voice, copywriting" },
];

// GET /api/agents — List all agents with status
export async function GET() {
  const agents = await Promise.all(
    AGENTS.map(async (agent) => {
      const isRunning = await checkHealth(agent.port);
      const soulPath = path.join(PROJECT_DIR, agent.homeDir, "SOUL.md");
      const soulContent = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, "utf-8") : "";
      const logPath = path.join(PROJECT_DIR, agent.homeDir, "activity.log");
      const logs = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean).slice(-20) : [];

      return {
        ...agent,
        status: isRunning ? "running" : "stopped",
        soulPreview: soulContent.slice(0, 200),
        logs: logs.map(parseLogEntry),
      };
    })
  );

  return NextResponse.json({ agents });
}

async function checkHealth(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

function parseLogEntry(line: string) {
  try {
    return JSON.parse(line);
  } catch {
    return { timestamp: new Date().toISOString(), message: line, level: "info" };
  }
}
```

### 2. Create start/stop API route

Create `src/app/api/agents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";
const HERMES_BIN = path.join(PROJECT_DIR, "hermes-agent", ".venv", "Scripts", "hermes.exe");

const AGENTS: Record<string, { port: number; homeDir: string }> = {
  brain: { port: 8642, homeDir: ".hermes-brain" },
  storeops: { port: 8643, homeDir: ".hermes-storeops" },
  marketing: { port: 8644, homeDir: ".hermes-marketing" },
  customer: { port: 8645, homeDir: ".hermes-customer" },
};

// POST /api/agents/[id] — Start or stop an agent
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = await req.json();
  const agent = AGENTS[id];

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (action === "start") {
    // Check if already running
    try {
      const res = await fetch(`http://127.0.0.1:${agent.port}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return NextResponse.json({ success: true, message: "Already running" });
      }
    } catch {}

    // Start the gateway
    const hermesHome = path.join(PROJECT_DIR, agent.homeDir);
    const child = spawn(HERMES_BIN, ["gateway"], {
      env: { ...process.env, HERMES_HOME: hermesHome },
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    // Wait for it to start
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const res = await fetch(`http://127.0.0.1:${agent.port}/health`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          logActivity(id, "Agent started", "info");
          return NextResponse.json({ success: true, message: "Started" });
        }
      } catch {}
    }

    return NextResponse.json({ error: "Failed to start" }, { status: 500 });
  }

  if (action === "stop") {
    try {
      // Find and kill the process on the agent's port
      const { stdout } = await exec(`lsof -ti:${agent.port}`).catch(() => ({ stdout: "" }));
      const pid = stdout.trim();
      if (pid) {
        process.kill(parseInt(pid), "SIGTERM");
        logActivity(id, "Agent stopped", "info");
        return NextResponse.json({ success: true, message: "Stopped" });
      }
      return NextResponse.json({ success: true, message: "Was not running" });
    } catch {
      return NextResponse.json({ error: "Failed to stop" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

function logActivity(agentId: string, message: string, level: string) {
  const logPath = path.join(PROJECT_DIR, `.hermes-${agentId}`, "activity.log");
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), message, level, agent: agentId });
  fs.appendFileSync(logPath, entry + "\n");
}
```

### 3. Create SOUL.md editor API route

Create `src/app/api/agents/[id]/soul/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";

const AGENTS: Record<string, string> = {
  brain: ".hermes-brain",
  storeops: ".hermes-storeops",
  marketing: ".hermes-marketing",
  customer: ".hermes-customer",
};

// GET /api/agents/[id]/soul — Read SOUL.md
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homeDir = AGENTS[id];
  if (!homeDir) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const soulPath = path.join(PROJECT_DIR, homeDir, "SOUL.md");
  const content = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, "utf-8") : "";

  return NextResponse.json({ content, path: soulPath });
}

// PUT /api/agents/[id]/soul — Update SOUL.md
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homeDir = AGENTS[id];
  if (!homeDir) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const { content } = await req.json();
  const soulPath = path.join(PROJECT_DIR, homeDir, "SOUL.md");

  // Backup current version
  const backupPath = soulPath + ".backup." + Date.now();
  if (fs.existsSync(soulPath)) {
    fs.copyFileSync(soulPath, backupPath);
  }

  fs.writeFileSync(soulPath, content, "utf-8");

  return NextResponse.json({ success: true, message: "SOUL.md updated. Restart agent to apply." });
}
```

### 4. Update the Agents page to be functional

Replace `src/app/agents/page.tsx` with a functional version that:
- Fetches agent data from `/api/agents` on mount and every 10 seconds
- Shows real status (running/stopped) with green/red indicators
- Has Start/Stop buttons that call `/api/agents/[id]` with action: "start" or "stop"
- Shows real activity logs from the log files
- Has an "Edit SOUL.md" button that opens a modal with a textarea editor
- Saves SOUL.md changes via `/api/agents/[id]/soul`

The page should have these sections:

**Agent Cards (top):**
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🧠 Brain         │ │ 📦 Store Ops     │ │ 📣 Marketing     │ │ 💬 Customer      │
│ ● Running        │ │ ● Running        │ │ ● Stopped        │ │ ● Running        │
│ Port: 8642       │ │ Port: 8643       │ │ Port: 8644       │ │ Port: 8645       │
│                  │ │                  │ │                  │ │                  │
│ [Stop] [Edit]    │ │ [Stop] [Edit]    │ │ [Start] [Edit]   │ │ [Stop] [Edit]    │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Activity Log (middle):**
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Activity Log                                             │
│                                                             │
│ 14:32  [INFO]  Brain: Routed "add product" to Store Ops     │
│ 14:30  [INFO]  Store Ops: Created product "Nike Air Max"    │
│ 14:28  [WARN]  Marketing: Low engagement on last post       │
│ 14:25  [INFO]  Customer: Auto-resolved support ticket #1042 │
│                                                             │
│ [Clear] [Export]                                            │
└─────────────────────────────────────────────────────────────┘
```

**SOUL.md Editor (modal/expandable):**
```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Edit Store Ops System Prompt                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ # Store Ops Agent — HermesStore                         │ │
│ │                                                         │ │
│ │ You are the Store Operations department...              │ │
│ │                                                         │ │
│ │ (full SOUL.md content in textarea)                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ Changes take effect after agent restart                  │
│                                                             │
│ [Cancel] [Save & Restart] [Save Only]                       │
└─────────────────────────────────────────────────────────────┘
```

### 5. Update types

Add to `src/lib/types.ts`:

```typescript
export interface AgentStatus {
  id: string;
  name: string;
  department: string;
  port: number;
  homeDir: string;
  description: string;
  status: "running" | "stopped";
  soulPreview: string;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: "info" | "warn" | "error";
  agent?: string;
}
```

## Important Notes

1. The start/stop functionality uses `child_process.spawn` to start hermes gateways and `lsof` + `kill` to stop them
2. SOUL.md editing creates a backup before saving
3. Activity logs are stored as JSONL files in each profile directory
4. The page polls `/api/agents` every 10 seconds for live status
5. On Windows, `lsof` may not work — use `netstat` or `taskkill` as fallback
6. The "Save & Restart" button saves SOUL.md then stops+starts the agent

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /agents page shows 4 agent cards with real status
- [ ] Start/Stop buttons actually control the gateways
- [ ] Activity log shows real entries
- [ ] Edit SOUL.md opens editor with current content
- [ ] Saving SOUL.md writes the file correctly
- [ ] Status updates every 10 seconds

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: functional agent management — start/stop, activity logs, SOUL.md editor"
```
