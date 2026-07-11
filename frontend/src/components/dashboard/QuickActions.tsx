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
    <Card className="bg-obsidian border-charcoal rounded-2xl">
      <div className="p-4 border-b border-charcoal">
        <h2 className="text-lg font-medium text-snow">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-3 border-charcoal bg-ash/50 hover:bg-ash text-snow rounded-2xl text-left"
          >
            <div className="flex items-center gap-2 text-snow">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </div>
            <span className="text-xs text-smoke">{action.description}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
