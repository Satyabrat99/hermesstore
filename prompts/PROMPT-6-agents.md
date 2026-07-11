# PROMPT 6: Agents Page (Status + Cron Jobs + Logs)

> Feed this to Command Code after Prompt 5 is verified.

---

In C:\Users\satya\HermesStore\frontend, build the Agents page showing agent status, cron job schedules, and activity logs.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

The app already has: Dashboard, Products, Add Product, Marketing pages. Sidebar navigation working.

## What to Build

### 1. Add agent types to src/lib/types.ts

Append:

```typescript
export interface Agent {
  id: string;
  name: string;
  department: "storeops" | "marketing" | "customer-brand" | "brain";
  type: "cron" | "ondemand";
  status: "active" | "idle" | "running" | "error" | "paused";
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  runsToday: number;
  tokensUsed: number;
  description: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  result: "success" | "error" | "warning";
  timestamp: string;
  details?: string;
}
```

### 2. Add agent mock data to src/lib/mock-data.ts

Append:

```typescript
export const mockAgents: Agent[] = [
  {
    id: "1", name: "Product Lister", department: "storeops", type: "ondemand",
    status: "idle", runsToday: 3, tokensUsed: 12500,
    description: "Creates products from voice, image, or text input",
  },
  {
    id: "2", name: "Pricing Strategist", department: "storeops", type: "ondemand",
    status: "idle", runsToday: 2, tokensUsed: 8900,
    description: "Analyzes competitors and recommends pricing",
  },
  {
    id: "3", name: "Inventory Tracker", department: "storeops", type: "cron",
    status: "active", schedule: "Every 6h", lastRun: "12:00 PM", nextRun: "6:00 PM",
    runsToday: 2, tokensUsed: 4200,
    description: "Monitors stock levels and predicts stockouts",
  },
  {
    id: "4", name: "Social Media Manager", department: "marketing", type: "ondemand",
    status: "idle", runsToday: 1, tokensUsed: 6700,
    description: "Generates and schedules social media posts",
  },
  {
    id: "5", name: "Content Creator", department: "marketing", type: "ondemand",
    status: "running", runsToday: 2, tokensUsed: 15200,
    description: "Generates product images, carousels, and graphics",
  },
  {
    id: "6", name: "Engagement Responder", department: "marketing", type: "cron",
    status: "active", schedule: "Every 30m", lastRun: "2:30 PM", nextRun: "3:00 PM",
    runsToday: 12, tokensUsed: 8400,
    description: "Monitors and replies to comments and DMs",
  },
  {
    id: "7", name: "Support Agent", department: "customer-brand", type: "cron",
    status: "active", schedule: "Every 15m", lastRun: "2:45 PM", nextRun: "3:00 PM",
    runsToday: 24, tokensUsed: 18600,
    description: "Handles customer queries and drafts responses",
  },
  {
    id: "8", name: "Brand Guardian", department: "customer-brand", type: "ondemand",
    status: "active", runsToday: 5, tokensUsed: 3200,
    description: "Enforces brand voice across all content",
  },
  {
    id: "9", name: "Competitor Monitor", department: "storeops", type: "cron",
    status: "paused", schedule: "Every 2h", lastRun: "10:00 AM", nextRun: "Paused",
    runsToday: 0, tokensUsed: 0,
    description: "Tracks competitor prices and products",
  },
];

export const mockAgentLogs: AgentLog[] = [
  { id: "1", agentId: "3", agentName: "Inventory Tracker", action: "Checked 8 products. 1 low stock alert.", result: "warning", timestamp: "2:30 PM", details: "SKU-1234 has 12 units remaining" },
  { id: "2", agentId: "7", agentName: "Support Agent", action: "Auto-resolved 3 tickets (order status queries)", result: "success", timestamp: "2:15 PM" },
  { id: "3", agentId: "5", agentName: "Content Creator", action: "Generating Instagram carousel for Summer Sale", result: "success", timestamp: "2:00 PM" },
  { id: "4", agentId: "6", agentName: "Engagement Responder", action: "Replied to 5 Instagram comments", result: "success", timestamp: "1:30 PM" },
  { id: "5", agentId: "2", agentName: "Pricing Strategist", action: "Recommended price drop for 3 products", result: "success", timestamp: "1:00 PM" },
  { id: "6", agentId: "1", agentName: "Product Lister", action: "Created product: Nike Air Max 90", result: "success", timestamp: "12:30 PM" },
  { id: "7", agentId: "9", agentName: "Competitor Monitor", action: "Connection timeout — paused", result: "error", timestamp: "10:00 AM", details: "Failed to reach competitor URL after 3 retries" },
];
```

### 3. Create Agents page

Create `src/app/agents/page.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockAgents, mockAgentLogs } from "@/lib/mock-data";
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Settings,
  Filter,
} from "lucide-react";
import { useState } from "react";

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  idle: { icon: Clock, color: "text-zinc-500", bg: "bg-zinc-500/10" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  paused: { icon: Pause, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

const departmentColors = {
  brain: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "customer-brand": "bg-green-500/10 text-green-500 border-green-500/20",
};

const resultConfig = {
  success: { icon: CheckCircle2, color: "text-green-500" },
  error: { icon: AlertCircle, color: "text-red-500" },
  warning: { icon: AlertCircle, color: "text-yellow-500" },
};

export default function AgentsPage() {
  const [filter, setFilter] = useState<string>("all");

  const departments = ["all", "storeops", "marketing", "customer-brand"];
  const filtered = filter === "all" ? mockAgents : mockAgents.filter((a) => a.department === filter);

  const totalTokens = mockAgents.reduce((sum, a) => sum + a.tokensUsed, 0);
  const activeAgents = mockAgents.filter((a) => a.status === "active" || a.status === "running").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {mockAgents.length} agents · {activeAgents} active · {(totalTokens / 1000).toFixed(1)}K tokens today
          </p>
        </div>
        <Button variant="outline" className="border-zinc-700 text-zinc-300">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: mockAgents.length.toString(), icon: Bot },
          { label: "Active Now", value: activeAgents.toString(), icon: Activity },
          { label: "Runs Today", value: mockAgents.reduce((s, a) => s + a.runsToday, 0).toString(), icon: RotateCcw },
          { label: "Tokens Used", value: `${(totalTokens / 1000).toFixed(1)}K`, icon: Zap },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">{stat.label}</span>
                <Icon className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Department Filter */}
      <div className="flex gap-2">
        {departments.map((dept) => (
          <Button
            key={dept}
            variant={filter === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(dept)}
            className={
              filter === dept
                ? "bg-blue-600 text-white"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }
          >
            {dept === "all" ? "All" : dept === "customer-brand" ? "Customer/Brand" : dept.charAt(0).toUpperCase() + dept.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List (2/3) */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="divide-y divide-zinc-800">
              {filtered.map((agent) => {
                const config = statusConfig[agent.status];
                const Icon = config.icon;
                return (
                  <div key={agent.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg ${config.bg}`}>
                          <Icon
                            className={`w-4 h-4 ${config.color} ${agent.status === "running" ? "animate-spin" : ""}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{agent.name}</span>
                            <Badge variant="outline" className={departmentColors[agent.department]}>
                              {agent.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {agent.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500 mb-2">{agent.description}</p>
                          <div className="flex gap-4 text-xs text-zinc-500">
                            {agent.schedule && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {agent.schedule}
                              </span>
                            )}
                            {agent.lastRun && (
                              <span>Last: {agent.lastRun}</span>
                            )}
                            <span>{agent.runsToday} runs today</span>
                            <span>{(agent.tokensUsed / 1000).toFixed(1)}K tokens</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {agent.status === "paused" ? (
                          <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300">
                            <Play className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-yellow-400 hover:text-yellow-300">
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-zinc-400 hover:text-white">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Activity Log (1/3) */}
        <div>
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Activity Log</h2>
            </div>
            <div className="divide-y divide-zinc-800">
              {mockAgentLogs.map((log) => {
                const config = resultConfig[log.result];
                const Icon = config.icon;
                return (
                  <div key={log.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-3 h-3 mt-1 ${config.color}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-white">{log.agentName}</span>
                          <span className="text-xs text-zinc-600">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-zinc-500 mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /agents shows agent management page
- [ ] Stats: Total Agents, Active Now, Runs Today, Tokens Used
- [ ] Department filter works (All, Storeops, Marketing, Customer/Brand)
- [ ] Agent list shows 9 agents with status, department, schedule, tokens
- [ ] Activity log shows 7 recent log entries
- [ ] Play/Pause buttons visible per agent
- [ ] Running agents show spinning icon

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: agents page with status, cron jobs, activity log"
```
