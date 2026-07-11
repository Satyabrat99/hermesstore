"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  prompt: string;
  status: string;
  department: string;
  lastRun?: string;
  nextRun?: string;
  lastResult?: string;
}

const deptColors: Record<string, string> = {
  brain: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  customer: "bg-phosphor/10 text-phosphor border-phosphor/20",
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  active: { icon: CheckCircle2, color: "text-phosphor" },
  paused: { icon: Pause, color: "text-yellow-500" },
  running: { icon: Loader2, color: "text-phosphor" },
  error: { icon: AlertCircle, color: "text-red-500" },
};

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newJob, setNewJob] = useState({ name: "", schedule: "", prompt: "", department: "storeops" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (jobId: string, department: string, action: string) => {
    setActionLoading(`${jobId}-${action}`);
    try {
      await fetch(`/api/cron/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, department }),
      });
      await fetchJobs();
    } catch {}
    setActionLoading(null);
  };

  const handleCreate = async () => {
    if (!newJob.name || !newJob.schedule || !newJob.prompt) return;
    try {
      await fetch("/api/cron/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      setShowCreate(false);
      setNewJob({ name: "", schedule: "", prompt: "", department: "storeops" });
      await fetchJobs();
    } catch {}
  };

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.department === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-snow">Cron Jobs</h1>
          <p className="text-sm text-silver mt-1">
            {jobs.length} jobs across {new Set(jobs.map((j) => j.department)).size} agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} className="border-charcoal text-silver rounded-full">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium">
            <Plus className="w-4 h-4 mr-1" />
            Create Job
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "brain", "storeops", "marketing", "customer"].map((dept) => (
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
            {dept === "all" ? "All" : dept === "customer" ? "Customer" : dept.charAt(0).toUpperCase() + dept.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-smoke animate-spin mx-auto" />
          <p className="text-smoke mt-2">Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-graphite mx-auto mb-3" />
          <p className="text-smoke">No cron jobs found</p>
          <p className="text-xs text-graphite mt-1">Create one or run the setup script</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const config = statusConfig[job.status] || statusConfig.paused;
            const Icon = config.icon;
            return (
              <Card key={`${job.department}-${job.id}`} className="bg-obsidian border-charcoal rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon
                        className={`w-5 h-5 ${config.color} ${job.status === "running" ? "animate-spin" : ""}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-snow">{job.name}</span>
                        <Badge variant="outline" className={`rounded-full ${deptColors[job.department] || ""}`}>
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-charcoal text-smoke rounded-full">
                          {job.schedule}
                        </Badge>
                      </div>
                      <p className="text-xs text-smoke mb-2 line-clamp-2">{job.prompt}</p>
                      <div className="flex gap-4 text-xs text-graphite">
                        {job.lastRun && <span>Last: {new Date(job.lastRun).toLocaleString()}</span>}
                        {job.nextRun && <span>Next: {new Date(job.nextRun).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {job.status === "paused" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(job.id, job.department, "resume")}
                        disabled={actionLoading === `${job.id}-resume`}
                        className="text-phosphor hover:text-mint"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(job.id, job.department, "pause")}
                        disabled={actionLoading === `${job.id}-pause`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(job.id, job.department, "run")}
                      disabled={actionLoading === `${job.id}-run`}
                      className="text-phosphor hover:text-mint"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(job.id, job.department, "delete")}
                      disabled={actionLoading === `${job.id}-delete`}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4 bg-obsidian border-charcoal rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-snow">Create Cron Job</h2>
              <button onClick={() => setShowCreate(false)} className="text-smoke hover:text-snow">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-silver mb-1 block">Name</label>
                <Input
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  placeholder="e.g. price-checker"
                  className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                />
              </div>
              <div>
                <label className="text-sm text-silver mb-1 block">Schedule</label>
                <Input
                  value={newJob.schedule}
                  onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                  placeholder="e.g. every 2h, 0 9 * * *"
                  className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                />
              </div>
              <div>
                <label className="text-sm text-silver mb-1 block">Department</label>
                <select
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  className="w-full bg-ash border border-slate text-snow rounded-full px-3 py-2 text-sm focus:outline-none focus:border-phosphor"
                >
                  <option value="storeops">Store Ops</option>
                  <option value="marketing">Marketing</option>
                  <option value="customer">Customer/Brand</option>
                  <option value="brain">Brain</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-silver mb-1 block">Prompt (what the agent does)</label>
                <textarea
                  value={newJob.prompt}
                  onChange={(e) => setNewJob({ ...newJob, prompt: e.target.value })}
                  placeholder="Describe what the agent should do when this job runs..."
                  className="w-full h-24 bg-ash border border-slate text-snow rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-phosphor"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-charcoal text-silver rounded-full">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="flex-1 bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium">
                  Create Job
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
