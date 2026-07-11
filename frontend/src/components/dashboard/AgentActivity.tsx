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
  completed: { icon: CheckCircle2, color: "text-phosphor", bg: "bg-phosphor/10" },
  running: { icon: Loader2, color: "text-phosphor", bg: "bg-phosphor/10" },
  alert: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  pending: { icon: Clock, color: "text-smoke", bg: "bg-smoke/10" },
};

export function AgentActivity() {
  return (
    <Card className="bg-obsidian border-charcoal rounded-2xl">
      <div className="p-4 border-b border-charcoal">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-phosphor" />
          <h2 className="text-lg font-medium text-snow">Agent Activity</h2>
        </div>
      </div>
      <div className="divide-y divide-charcoal">
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
                  <span className="text-sm font-medium text-snow">{item.agent}</span>
                  <Badge variant="outline" className="text-xs border-charcoal text-smoke">
                    {item.time}
                  </Badge>
                </div>
                <p className="text-sm text-silver">{item.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
