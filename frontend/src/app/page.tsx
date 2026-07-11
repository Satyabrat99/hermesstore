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
