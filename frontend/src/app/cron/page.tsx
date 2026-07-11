"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CronJob {
  id: string;
  name: string;
  schedule: { display?: string };
  schedule_display?: string;
  prompt: string;
  enabled: boolean;
  state: string;
  department: string;
  last_run_at?: string;
  next_run_at?: string;
}

const deptColors: Record<string, string> = {
  brain: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  customer: "bg-green-500/10 text-green-500 border-green-500/20",
};

const deptLabels: Record<string, string> = {
  brain: "Brain",
  storeops: "Store Ops",
  marketing: "Marketing",
  customer: "Customer",
};

const API_KEYS: Record<string, string> = {
  brain: "hermesstore-brain-2026-secret-key-32c",
  storeops: "hermesstore-storeops-2026-secret-32c",
  marketing: "hermesstore-marketing-2026-secret-32c",
  customer: "hermesstore-customer-2026-secret-32c",
};

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const proxyFetch = async (dept: string, path: string, options?: RequestInit) => {
    const url = `/api/proxy?dept=${dept}&path=${encodeURIComponent(path)}`;
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${API_KEYS[dept]}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  };

  const fetchJobs = async () => {
    const allJobs: CronJob[] = [];

    for (const dept of Object.keys(API_KEYS)) {
      try {
        const res = await proxyFetch(dept, "/api/jobs");
        if (res.ok) {
          const data = await res.json();
          const deptJobs = Array.isArray(data) ? data : data.jobs || [];
          allJobs.push(...deptJobs.map((j: CronJob) => ({ ...j, department: dept })));
        }
      } catch {
        // gateway not running
      }
    }

    setJobs(allJobs);
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
      const path = action === "delete"
        ? `/api/jobs/${jobId}`
        : `/api/jobs/${jobId}/${action}`;

      await proxyFetch(department, path, {
        method: action === "delete" ? "DELETE" : "POST",
      });
      await fetchJobs();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.department === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cron Jobs</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {jobs.length} jobs across {new Set(jobs.map((j) => j.department)).size} agents
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} className="border-zinc-700 text-zinc-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "brain", "storeops", "marketing", "customer"].map((dept) => (
          <Button
            key={dept}
            variant={filter === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(dept)}
            className={filter === dept ? "bg-blue-600 text-white" : "border-zinc-800 text-zinc-400"}
          >
            {dept === "all" ? "All" : deptLabels[dept] || dept}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
          <p className="text-zinc-500 mt-2">Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No cron jobs found</p>
          <p className="text-xs text-zinc-600 mt-1">Make sure gateways are running</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={`${job.department}-${job.id}`} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {job.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Pause className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{job.name}</span>
                      <Badge variant="outline" className={deptColors[job.department] || ""}>
                        {deptLabels[job.department] || job.department}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                        {job.schedule?.display || job.schedule_display || "—"}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{job.prompt}</p>
                    <div className="flex gap-4 text-xs text-zinc-600">
                      {job.next_run_at && (
                        <span>Next: {new Date(job.next_run_at).toLocaleString()}</span>
                      )}
                      {job.last_run_at && (
                        <span>Last: {new Date(job.last_run_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!job.enabled ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(job.id, job.department, "resume")}
                      disabled={actionLoading === `${job.id}-resume`}
                      className="text-green-400 hover:text-green-300"
                      title="Enable"
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
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(job.id, job.department, "run")}
                    disabled={actionLoading === `${job.id}-run`}
                    className="text-blue-400 hover:text-blue-300"
                    title="Run Now"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(job.id, job.department, "delete")}
                    disabled={actionLoading === `${job.id}-delete`}
                    className="text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
