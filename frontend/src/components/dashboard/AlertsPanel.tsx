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
  warning: { icon: AlertTriangle, color: "text-yellow-500", border: "border-l-yellow-500" },
  info: { icon: Bell, color: "text-phosphor", border: "border-l-phosphor" },
  success: { icon: CheckCircle, color: "text-phosphor", border: "border-l-phosphor" },
};

export function AlertsPanel() {
  return (
    <Card className="bg-obsidian border-charcoal rounded-2xl">
      <div className="p-4 border-b border-charcoal">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-medium text-snow">Alerts</h2>
          </div>
          <Badge variant="outline" className="border-charcoal text-smoke">
            {alerts.length} active
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-charcoal">
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
                      <span className="text-sm font-medium text-snow">{alert.title}</span>
                      <span className="text-xs text-smoke">{alert.time}</span>
                    </div>
                    <p className="text-sm text-silver">{alert.description}</p>
                    {alert.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-charcoal text-silver hover:bg-ash rounded-full"
                      >
                        {alert.action}
                      </Button>
                    )}
                  </div>
                </div>
                <button className="text-smoke hover:text-snow">
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
