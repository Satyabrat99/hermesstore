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
        <Card key={metric.label} className="bg-obsidian border-charcoal rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">{metric.label}</span>
            <span className="text-smoke">{metric.icon}</span>
          </div>
          <div className="text-2xl font-medium text-snow">{metric.value}</div>
          <div className="flex items-center gap-1 mt-1">
            {metric.trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-phosphor" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span
              className={`text-xs ${
                metric.trend === "up" ? "text-phosphor" : "text-red-500"
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
