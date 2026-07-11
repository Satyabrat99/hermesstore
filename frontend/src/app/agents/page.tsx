"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockAgents, mockAgentLogs } from "@/lib/mock-data";
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Settings,
} from "lucide-react";
import { useState } from "react";

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-phosphor", bg: "bg-phosphor/10" },
  idle: { icon: Clock, color: "text-smoke", bg: "bg-smoke/10" },
  running: { icon: Loader2, color: "text-phosphor", bg: "bg-phosphor/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  paused: { icon: Pause, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

const departmentColors = {
  brain: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "customer-brand": "bg-phosphor/10 text-phosphor border-phosphor/20",
};

const resultConfig = {
  success: { icon: CheckCircle2, color: "text-phosphor" },
  error: { icon: AlertCircle, color: "text-red-500" },
  warning: { icon: AlertCircle, color: "text-yellow-500" },
};

export default function AgentsPage() {
  const [filter, setFilter] = useState<string>("all");

  const departments = ["all", "storeops", "marketing", "customer-brand"];
  const filtered = filter === "all" ? mockAgents : mockAgents.filter((a) => a.department === filter);

  const totalTokens = mockAgents.reduce((sum, a) => sum + a.tokensUsed, 0);
  const activeAgents = mockAgents.filter((a) => a.status === "active" || a.status === "running").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-snow">Agents</h1>
          <p className="text-sm text-silver mt-1">
            {mockAgents.length} agents · {activeAgents} active · {(totalTokens / 1000).toFixed(1)}K tokens today
          </p>
        </div>
        <Button variant="outline" className="border-charcoal text-silver rounded-full">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: mockAgents.length.toString(), icon: Bot },
          { label: "Active Now", value: activeAgents.toString(), icon: Activity },
          { label: "Runs Today", value: mockAgents.reduce((s, a) => s + a.runsToday, 0).toString(), icon: RotateCcw },
          { label: "Tokens Used", value: `${(totalTokens / 1000).toFixed(1)}K`, icon: Zap },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-obsidian border-charcoal rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-silver text-sm">{stat.label}</span>
                <Icon className="w-4 h-4 text-smoke" />
              </div>
              <div className="text-xl font-medium text-snow">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        {departments.map((dept) => (
          <Button
            key={dept}
            variant={filter === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(dept)}
            className={
              filter === dept
                ? "bg-phosphor text-obsidian rounded-full"
                : "border-charcoal text-silver hover:bg-ash rounded-full"
            }
          >
            {dept === "all" ? "All" : dept === "customer-brand" ? "Customer/Brand" : dept.charAt(0).toUpperCase() + dept.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="divide-y divide-charcoal">
              {filtered.map((agent) => {
                const config = statusConfig[agent.status];
                const Icon = config.icon;
                return (
                  <div key={agent.id} className="p-4 hover:bg-ash/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-xl ${config.bg}`}>
                          <Icon
                            className={`w-4 h-4 ${config.color} ${agent.status === "running" ? "animate-spin" : ""}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-snow">{agent.name}</span>
                            <Badge variant="outline" className={`rounded-full ${departmentColors[agent.department]}`}>
                              {agent.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-charcoal text-smoke rounded-full">
                              {agent.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-smoke mb-2">{agent.description}</p>
                          <div className="flex gap-4 text-xs text-smoke">
                            {agent.schedule && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {agent.schedule}
                              </span>
                            )}
                            {agent.lastRun && (
                              <span>Last: {agent.lastRun}</span>
                            )}
                            <span>{agent.runsToday} runs today</span>
                            <span>{(agent.tokensUsed / 1000).toFixed(1)}K tokens</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {agent.status === "paused" ? (
                          <Button variant="ghost" size="sm" className="h-7 text-phosphor hover:text-mint">
                            <Play className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-yellow-400 hover:text-yellow-300">
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-smoke hover:text-snow">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="p-4 border-b border-charcoal">
              <h2 className="text-lg font-medium text-snow">Activity Log</h2>
            </div>
            <div className="divide-y divide-charcoal">
              {mockAgentLogs.map((log) => {
                const config = resultConfig[log.result];
                const Icon = config.icon;
                return (
                  <div key={log.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-3 h-3 mt-1 ${config.color}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-snow">{log.agentName}</span>
                          <span className="text-xs text-graphite">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-silver">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-smoke mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
