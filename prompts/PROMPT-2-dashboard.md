# PROMPT 2: Dashboard Page with Metrics + Agent Activity

> Feed this to Command Code after Prompt 1 is verified.

---

In C:\Users\satya\HermesStore\frontend, build the Dashboard page with metric cards, agent activity feed, and alerts panel.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

The app already has:
- Next.js 15 + Tailwind v4 + shadcn/ui (dark theme)
- Chat sidebar (persistent, left side)
- Hermes API client at `src/lib/hermes-client.ts`
- Zustand store at `src/lib/store.ts`
- Dashboard placeholder at `src/app/page.tsx`

## What to Build

### 1. Create MetricCards component

Create `src/components/dashboard/MetricCards.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Users, Percent } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const metrics: Metric[] = [
  {
    label: "Revenue",
    value: "₹1,24,500",
    change: "+12.5%",
    trend: "up",
    icon: <IndianRupee className="w-5 h-5" />,
  },
  {
    label: "Orders",
    value: "47",
    change: "+8.2%",
    trend: "up",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: "Conversion",
    value: "3.2%",
    change: "-0.3%",
    trend: "down",
    icon: <Percent className="w-5 h-5" />,
  },
  {
    label: "Visitors",
    value: "1,470",
    change: "+15.1%",
    trend: "up",
    icon: <Users className="w-5 h-5" />,
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm">{metric.label}</span>
            <span className="text-zinc-500">{metric.icon}</span>
          </div>
          <div className="text-2xl font-bold text-white">{metric.value}</div>
          <div className="flex items-center gap-1 mt-1">
            {metric.trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span
              className={`text-xs ${
                metric.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {metric.change} vs last week
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Create AgentActivity component

Create `src/components/dashboard/AgentActivity.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  time: string;
  status: "completed" | "running" | "alert" | "pending";
}

const activities: ActivityItem[] = [
  {
    id: "1",
    agent: "Pricing Agent",
    action: "Repriced 12 products based on competitor analysis. Avg margin: 18%",
    time: "14:32",
    status: "completed",
  },
  {
    id: "2",
    agent: "Listing Agent",
    action: "Generated descriptions for 5 new products",
    time: "14:15",
    status: "completed",
  },
  {
    id: "3",
    agent: "Competitor Agent",
    action: "Scanned 8 stores. 3 price changes detected",
    time: "13:45",
    status: "alert",
  },
  {
    id: "4",
    agent: "Support Agent",
    action: "Auto-resolved 8/10 support tickets today",
    time: "12:00",
    status: "completed",
  },
  {
    id: "5",
    agent: "CRO Agent",
    action: "Running A/B test on product page layout",
    time: "11:30",
    status: "running",
  },
  {
    id: "6",
    agent: "Marketing Agent",
    action: "Scheduled 3 Instagram posts for tomorrow",
    time: "10:45",
    status: "pending",
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
  alert: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  pending: { icon: Clock, color: "text-zinc-500", bg: "bg-zinc-500/10" },
};

export function AgentActivity() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Agent Activity</h2>
        </div>
      </div>
      <div className="divide-y divide-zinc-800">
        {activities.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          return (
            <div key={item.id} className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 p-1 rounded-full ${config.bg}`}>
                <Icon
                  className={`w-4 h-4 ${config.color} ${
                    item.status === "running" ? "animate-spin" : ""
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{item.agent}</span>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                    {item.time}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{item.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

### 3. Create AlertsPanel component

Create `src/components/dashboard/AlertsPanel.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCircle, X } from "lucide-react";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  action?: string;
  time: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Competitor Price Drop",
    description: "Competitor X dropped Nike Air Max price to ₹7,999. Recommend matching at ₹7,499.",
    action: "Review",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "warning",
    title: "Low Stock Alert",
    description: "SKU-1234 (Nike Air Max) has 12 units remaining. Stockout in 3 days.",
    action: "Reorder",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "info",
    title: "Landing Page Ready",
    description: "Summer Sale landing page generated. Ready for review and publishing.",
    action: "Preview",
    time: "2 hours ago",
  },
  {
    id: "4",
    type: "success",
    title: "Support Tickets Cleared",
    description: "8 of 10 support tickets auto-resolved today. 2 escalated for review.",
    time: "3 hours ago",
  },
];

const typeConfig = {
  warning: { icon: AlertTriangle, color: "text-yellow-500", border: "border-yellow-500/20" },
  info: { icon: Bell, color: "text-blue-500", border: "border-blue-500/20" },
  success: { icon: CheckCircle, color: "text-green-500", border: "border-green-500/20" },
};

export function AlertsPanel() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            {alerts.length} active
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-zinc-800">
        {alerts.map((alert) => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;
          return (
            <div key={alert.id} className={`p-4 border-l-2 ${config.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{alert.title}</span>
                      <span className="text-xs text-zinc-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{alert.description}</p>
                    {alert.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        {alert.action}
                      </Button>
                    )}
                  </div>
                </div>
                <button className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

### 4. Create QuickActions component

Create `src/components/dashboard/QuickActions.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Megaphone, BarChart3, Package, MessageSquare } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  description: string;
}

const actions: QuickAction[] = [
  {
    label: "Add Product",
    icon: <Plus className="w-4 h-4" />,
    description: "Create a new product listing",
  },
  {
    label: "Update Prices",
    icon: <Tag className="w-4 h-4" />,
    description: "Review pricing recommendations",
  },
  {
    label: "Create Campaign",
    icon: <Megaphone className="w-4 h-4" />,
    description: "Launch a marketing campaign",
  },
  {
    label: "View Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Check store performance",
  },
  {
    label: "Check Inventory",
    icon: <Package className="w-4 h-4" />,
    description: "Review stock levels",
  },
  {
    label: "Support Queue",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "Handle customer tickets",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-3 border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-left"
          >
            <div className="flex items-center gap-2 text-white">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </div>
            <span className="text-xs text-zinc-500">{action.description}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
```

### 5. Update the Dashboard page

Update `src/app/page.tsx`:

```tsx
"use client";

import { MetricCards } from "@/components/dashboard/MetricCards";
import { AgentActivity } from "@/components/dashboard/AgentActivity";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Welcome back. Here&apos;s your store overview.
        </p>
      </div>

      {/* Metric Cards */}
      <MetricCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Activity (2 cols) */}
        <div className="lg:col-span-2">
          <AgentActivity />
        </div>

        {/* Right: Alerts + Quick Actions (1 col) */}
        <div className="space-y-6">
          <AlertsPanel />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
```

### 6. Remove "use client" from layout if present

The layout should be a server component. Make sure `src/app/layout.tsx` does NOT have `"use client"` at the top. The `ChatSidebar` import is fine because it's a client component used inside a server layout.

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds without errors
- [ ] Dashboard shows 4 metric cards (Revenue, Orders, Conversion, Visitors)
- [ ] Each card has value, trend arrow, and percentage change
- [ ] Agent Activity feed shows 6 items with different statuses
- [ ] Alerts panel shows 4 alerts with action buttons
- [ ] Quick Actions shows 6 action buttons in a grid
- [ ] Layout: metrics top, activity left (2/3), alerts+actions right (1/3)
- [ ] Dark theme consistent throughout
- [ ] Chat sidebar still visible on the left

Run `npm run start` and open http://localhost:3000 to verify visually.

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: dashboard with metric cards, agent activity, alerts, quick actions"
```
