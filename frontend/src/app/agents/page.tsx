"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileEdit,
  X,
  Save,
  RefreshCw,
  Trash2,
  Copy,
} from "lucide-react";
import type { AgentStatus, LogEntry } from "@/lib/types";

const statusConfig = {
  running: { icon: CheckCircle2, color: "text-phosphor", bg: "bg-phosphor/10", label: "Running" },
  stopped: { icon: Pause, color: "text-smoke", bg: "bg-smoke/10", label: "Stopped" },
};

const departmentColors = {
  brain: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "customer-brand": "bg-phosphor/10 text-phosphor border-phosphor/20",
};

const icons: Record<string, string> = {
  brain: "🧠",
  storeops: "📦",
  marketing: "📣",
  customer: "💬",
};

const levelColors: Record<string, string> = {
  info: "text-phosphor",
  warn: "text-yellow-500",
  error: "text-red-500",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingSoul, setEditingSoul] = useState<string | null>(null);
  const [soulContent, setSoulContent] = useState("");
  const [soulSaving, setSoulSaving] = useState(false);
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
      const logs = (data.agents || []).flatMap((a: AgentStatus) =>
        a.logs.map((l: LogEntry) => ({ ...l, agent: a.name }))
      );
      logs.sort((a: LogEntry, b: LogEntry) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setAllLogs(logs.slice(0, 50));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const handleAction = async (agentId: string, action: "start" | "stop") => {
    setActionId(agentId);
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchAgents();
    } catch {}
    setActionId(null);
  };

  const openSoulEditor = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/soul`);
      const data = await res.json();
      setSoulContent(data.content || "");
      setEditingSoul(agentId);
    } catch {}
  };

  const saveSoul = async (restart: boolean) => {
    if (!editingSoul) return;
    setSoulSaving(true);
    try {
      await fetch(`/api/agents/${editingSoul}/soul`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: soulContent }),
      });
      if (restart) {
        await handleAction(editingSoul, "stop");
        await new Promise((r) => setTimeout(r, 2000));
        await handleAction(editingSoul, "start");
      }
      setEditingSoul(null);
    } catch {}
    setSoulSaving(false);
  };

  const copySoul = () => {
    navigator.clipboard.writeText(soulContent);
  };

  const totalTokens = agents.reduce((sum, a) => sum + (a.status === "running" ? 5000 : 0), 0);
  const activeAgents = agents.filter((a) => a.status === "running").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-snow">Agents</h1>
          <p className="text-sm text-silver mt-1">
            {agents.length} agents · {activeAgents} running · Live status (10s refresh)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAgents}
            className="border-charcoal text-silver rounded-full"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: agents.length.toString(), icon: Bot },
          { label: "Running", value: activeAgents.toString(), icon: Activity },
          { label: "Stopped", value: (agents.length - activeAgents).toString(), icon: Clock },
          { label: "Logs", value: allLogs.length.toString(), icon: Zap },
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

      {/* Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const config = statusConfig[agent.status];
          const Icon = config.icon;
          return (
            <Card key={agent.id} className="bg-obsidian border-charcoal rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icons[agent.id]}</span>
                  <span className="text-sm font-medium text-snow">{agent.name}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${agent.status === "running" ? "bg-phosphor animate-pulse" : "bg-smoke"}`} />
                  <span className={`text-xs ${config.color}`}>{config.label}</span>
                </div>
              </div>
              <p className="text-xs text-smoke mb-1">{agent.description}</p>
              <p className="text-xs text-graphite mb-3">Port: {agent.port}</p>
              <div className="flex gap-2">
                {agent.status === "running" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(agent.id, "stop")}
                    disabled={actionId === agent.id}
                    className="flex-1 border-charcoal text-yellow-500 hover:text-yellow-400 rounded-full text-xs"
                  >
                    {actionId === agent.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Pause className="w-3 h-3 mr-1" />
                    )}
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(agent.id, "start")}
                    disabled={actionId === agent.id}
                    className="flex-1 border-charcoal text-phosphor hover:text-mint rounded-full text-xs"
                  >
                    {actionId === agent.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    Start
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSoulEditor(agent.id)}
                  className="border-charcoal text-silver hover:text-snow rounded-full text-xs"
                >
                  <FileEdit className="w-3 h-3 mr-1" />
                  SOUL
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Log */}
      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center justify-between">
          <h2 className="text-lg font-medium text-snow">Activity Log</h2>
          <span className="text-xs text-smoke">{allLogs.length} entries</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {allLogs.length === 0 ? (
            <div className="p-8 text-center text-smoke text-sm">
              No activity logs yet. Logs appear when agents perform actions.
            </div>
          ) : (
            <div className="divide-y divide-charcoal">
              {allLogs.map((log, i) => (
                <div key={i} className="px-4 py-2 flex items-start gap-3">
                  <span className="text-xs text-graphite mt-0.5 w-36 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] rounded-full shrink-0 ${
                      log.level === "error"
                        ? "border-red-500/20 text-red-500"
                        : log.level === "warn"
                        ? "border-yellow-500/20 text-yellow-500"
                        : "border-phosphor/20 text-phosphor"
                    }`}
                  >
                    {log.level}
                  </Badge>
                  <span className="text-xs text-silver">
                    <span className="font-medium text-snow">{log.agent || "System"}</span>: {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* SOUL.md Editor Modal */}
      {editingSoul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 bg-obsidian border-charcoal rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-charcoal flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-phosphor" />
                <h2 className="text-lg font-medium text-snow">
                  Edit {agents.find((a) => a.id === editingSoul)?.name} System Prompt
                </h2>
              </div>
              <button onClick={() => setEditingSoul(null)} className="text-smoke hover:text-snow">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={soulContent}
                onChange={(e) => setSoulContent(e.target.value)}
                className="w-full h-96 bg-ash border border-slate text-snow rounded-2xl p-4 text-sm font-mono resize-none focus:outline-none focus:border-phosphor"
                placeholder="# Agent System Prompt"
                spellCheck={false}
              />
              <p className="text-xs text-smoke mt-2">
                Changes take effect after agent restart.
              </p>
            </div>
            <div className="p-4 border-t border-charcoal flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={copySoul}
                className="text-smoke hover:text-snow"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingSoul(null)}
                  className="border-charcoal text-silver rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveSoul(false)}
                  disabled={soulSaving}
                  variant="outline"
                  className="border-charcoal text-silver rounded-full"
                >
                  {soulSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                  Save
                </Button>
                <Button
                  onClick={() => saveSoul(true)}
                  disabled={soulSaving}
                  className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
                >
                  {soulSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RotateCcw className="w-4 h-4 mr-1" />}
                  Save & Restart
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
