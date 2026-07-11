# PROMPT 7: Mock Dashboard Cards + Polish

> Feed this to Command Code after Prompt 6 is verified.

---

In C:\Users\satya\HermesStore\frontend, add mock "Coming Soon" cards for Fulfillment, Finance, and Analytics departments. Polish the overall UI.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

All 5 pages exist: Dashboard, Products, Add Product, Marketing, Agents.

## What to Build

### 1. Create "Coming Soon" card component

Create `src/components/dashboard/DepartmentCard.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

interface DepartmentCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

export function DepartmentCard({ name, description, icon, features, color }: DepartmentCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs">
          <Lock className="w-3 h-3 mr-1" /> Coming Soon
        </Badge>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{name}</h3>
      <p className="text-xs text-zinc-500 mb-3">{description}</p>
      <ul className="space-y-1 mb-4">
        {features.map((f) => (
          <li key={f} className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-white p-0">
        Learn more <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </Card>
  );
}
```

### 2. Update Dashboard page

Update `src/app/page.tsx` to include the department cards below the existing content:

```tsx
"use client";

import { MetricCards } from "@/components/dashboard/MetricCards";
import { AgentActivity } from "@/components/dashboard/AgentActivity";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DepartmentCard } from "@/components/dashboard/DepartmentCard";
import { Truck, DollarSign, BarChart3 } from "lucide-react";

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
        <div className="lg:col-span-2">
          <AgentActivity />
        </div>
        <div className="space-y-6">
          <AlertsPanel />
          <QuickActions />
        </div>
      </div>

      {/* Coming Soon Departments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">More Departments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DepartmentCard
            name="Fulfillment"
            description="Automated shipping, tracking, and returns management"
            icon={<Truck className="w-5 h-5 text-orange-500" />}
            features={["Shiprocket integration", "Auto carrier selection", "Delivery tracking", "Returns processing"]}
            color="bg-orange-500/10"
          />
          <DepartmentCard
            name="Finance"
            description="Revenue tracking, tax calculation, and cash flow forecasting"
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            features={["Revenue reconciliation", "GST calculation", "Cash flow forecast", "Profit margins"]}
            color="bg-emerald-500/10"
          />
          <DepartmentCard
            name="Analytics"
            description="Deep insights, competitor intel, and market trends"
            icon={<BarChart3 className="w-5 h-5 text-cyan-500" />}
            features={["ShopifyQL reports", "Competitor monitoring", "CRO optimization", "Market intelligence"]}
            color="bg-cyan-500/10"
          />
        </div>
      </div>
    </div>
  );
}
```

### 3. Add page transitions

Update `src/app/layout.tsx` to add a subtle fade transition between pages. Wrap the `{children}` in a div with a key and transition class:

```tsx
<main className="flex-1 bg-zinc-900 min-h-screen overflow-y-auto">
  {children}
</main>
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] Dashboard shows 3 "Coming Soon" department cards below existing content
- [ ] Fulfillment card: orange icon, Shiprocket, tracking, returns features
- [ ] Finance card: emerald icon, revenue, GST, cash flow features
- [ ] Analytics card: cyan icon, ShopifyQL, competitor, CRO features
- [ ] Each card has "Coming Soon" badge and "Learn more" link
- [ ] Overall layout clean and balanced

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: mock department cards (fulfillment, finance, analytics) + polish"
```
