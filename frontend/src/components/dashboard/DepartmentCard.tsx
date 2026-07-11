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
