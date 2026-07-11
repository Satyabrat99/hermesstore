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
    <Card className="bg-obsidian border-charcoal rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className="border-charcoal text-smoke text-xs rounded-full">
          <Lock className="w-3 h-3 mr-1" /> Coming Soon
        </Badge>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-base font-medium text-snow mb-1">{name}</h3>
      <p className="text-xs text-smoke mb-3">{description}</p>
      <ul className="space-y-1 mb-4">
        {features.map((f) => (
          <li key={f} className="text-xs text-silver flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-graphite" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="text-xs text-smoke hover:text-snow p-0">
        Learn more <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </Card>
  );
}
