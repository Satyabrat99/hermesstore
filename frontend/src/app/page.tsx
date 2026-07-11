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
