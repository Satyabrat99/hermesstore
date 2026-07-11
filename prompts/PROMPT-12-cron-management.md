# PROMPT 12: Cron Management Page (Create, Enable/Disable, View Logs)

> Feed this to Command Code after the gateways are running and cron jobs are created.

---

In C:\Users\satya\HermesStore\frontend, create a Cron Management page that allows users to view, enable/disable, create, and delete cron jobs across all 4 agent profiles.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

There are 4 Hermes agent gateways running:
- Brain: port 8642, key: hermesstore-brain-2026-secret-key-32c
- Store Ops: port 8643, key: hermesstore-storeops-2026-secret-32c
- Marketing: port 8644, key: hermesstore-marketing-2026-secret-32c
- Customer/Brand: port 8645, key: hermesstore-customer-2026-secret-32c

Each gateway has a cron API at `/api/jobs`:
- GET /api/jobs — list all jobs
- POST /api/jobs — create a job
- PATCH /api/jobs/{id} — update a job
- DELETE /api/jobs/{id} — delete a job
- POST /api/jobs/{id}/pause — pause a job
- POST /api/jobs/{id}/resume — resume a job
- POST /api/jobs/{id}/run — trigger a job immediately

## What to Build

### 1. Add cron types to src/lib/types.ts

```typescript
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  prompt: string;
  status: "active" | "paused" | "running" | "error";
  department: string;
  lastRun?: string;
  nextRun?: string;
  runsToday: number;
  lastResult?: string;
  createdAt: string;
}

export interface CronJobCreate {
  name: string;
  schedule: string;
  prompt: string;
  department: string;
}
```

### 2. Create cron API proxy route

Create `src/app/api/cron/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-32c" },
};

// GET /api/cron — Fetch all jobs from all profiles
export async function GET() {
  const allJobs: any[] = [];

  for (const [dept, config] of Object.entries(PROFILES)) {
    try {
      const res = await fetch(`http://127.0.0.1:${config.port}/api/jobs`, {
        headers: { Authorization: `Bearer ${config.key}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : data.jobs || [];
        allJobs.push(...jobs.map((j: any) => ({ ...j, department: dept })));
      }
    } catch {
      // Profile not running, skip
    }
  }

  return NextResponse.json({ jobs: allJobs });
}
```

### 3. Create cron job action route

Create `src/app/api/cron/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-32c" },
};

// POST /api/cron/[id] — Pause, resume, run, or delete a job
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, department } = await req.json();
  const profile = PROFILES[department];

  if (!profile) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  const endpoints: Record<string, string> = {
    pause: `/api/jobs/${id}/pause`,
    resume: `/api/jobs/${id}/resume`,
    run: `/api/jobs/${id}/run`,
    delete: `/api/jobs/${id}`,
  };

  const endpoint = endpoints[action];
  if (!endpoint) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const method = action === "delete" ? "DELETE" : "POST";
    const res = await fetch(`http://127.0.0.1:${profile.port}${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${profile.key}` },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
```

### 4. Create cron job creation route

Create `src/app/api/cron/create/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-32c" },
};

export async function POST(req: NextRequest) {
  const { name, schedule, prompt, department } = await req.json();
  const profile = PROFILES[department];

  if (!profile) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  try {
    const res = await fetch(`http://127.0.0.1:${profile.port}/api/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${profile.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        schedule,
        prompt,
        metadata: { department, enabled: false },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
```

### 5. Create the Cron Management page

Create `src/app/cron/page.tsx`:

```tsx
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
  brain: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  storeops: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  customer: "bg-green-500/10 text-green-500 border-green-500/20",
};

const statusConfig: Record<string, { icon: any; color: string }> = {
  active: { icon: CheckCircle2, color: "text-green-500" },
  paused: { icon: Pause, color: "text-yellow-500" },
  running: { icon: Loader2, color: "text-blue-500" },
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
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
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
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
    } catch {
      // ignore
    }
  };

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.department === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cron Jobs</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {jobs.length} jobs across {new Set(jobs.map((j) => j.department)).size} agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} className="border-zinc-700 text-zinc-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex gap-2">
        {["all", "brain", "storeops", "marketing", "customer"].map((dept) => (
          <Button
            key={dept}
            variant={filter === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(dept)}
            className={filter === dept ? "bg-blue-600 text-white" : "border-zinc-800 text-zinc-400"}
          >
            {dept === "all" ? "All" : dept === "customer" ? "Customer" : dept.charAt(0).toUpperCase() + dept.slice(1)}
          </Button>
        ))}
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
          <p className="text-zinc-500 mt-2">Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No cron jobs found</p>
          <p className="text-xs text-zinc-600 mt-1">Create one or run the setup script</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const config = statusConfig[job.status] || statusConfig.paused;
            const Icon = config.icon;
            return (
              <Card key={`${job.department}-${job.id}`} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon
                        className={`w-5 h-5 ${config.color} ${job.status === "running" ? "animate-spin" : ""}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{job.name}</span>
                        <Badge variant="outline" className={deptColors[job.department] || ""}>
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                          {job.schedule}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{job.prompt}</p>
                      <div className="flex gap-4 text-xs text-zinc-600">
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
                        className="text-green-400 hover:text-green-300"
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
                      className="text-blue-400 hover:text-blue-300"
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

      {/* Create Job Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4 bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create Cron Job</h2>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Name</label>
                <Input
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  placeholder="e.g. price-checker"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Schedule</label>
                <Input
                  value={newJob.schedule}
                  onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                  placeholder="e.g. every 2h, 0 9 * * *"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Department</label>
                <select
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="storeops">Store Ops</option>
                  <option value="marketing">Marketing</option>
                  <option value="customer">Customer/Brand</option>
                  <option value="brain">Brain</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Prompt (what the agent does)</label>
                <textarea
                  value={newJob.prompt}
                  onChange={(e) => setNewJob({ ...newJob, prompt: e.target.value })}
                  placeholder="Describe what the agent should do when this job runs..."
                  className="w-full h-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-zinc-700 text-zinc-300">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
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
```

### 6. Add Cron to sidebar navigation

Update `src/components/chat/ChatSidebar.tsx` to add a Cron link in the navigation:

Add to imports: `import { Clock } from "lucide-react";`

Add to navigation array:
```tsx
{ href: "/cron", label: "Cron Jobs", icon: Clock },
```

### 7. Create the cron setup API route

Create `src/app/api/cron/setup/route.ts` that runs the cron job creation script:

```typescript
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

// POST /api/cron/setup — Create all default cron jobs
export async function POST() {
  const scriptPath = path.join("C:\\Users\\satya\\HermesStore", "scripts", "create-cron-jobs.sh");
  
  try {
    // For Windows, use PowerShell
    const { stdout, stderr } = await execAsync(
      `powershell -ExecutionPolicy Bypass -File "C:\\Users\\satya\\HermesStore\\scripts\\create-cron-jobs.ps1"`,
      { timeout: 60000 }
    );
    return NextResponse.json({ success: true, output: stdout });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /cron page shows all cron jobs from all 4 agents
- [ ] Each job shows: name, department badge, schedule, status indicator
- [ ] Play/Pause buttons toggle job state
- [ ] Run Now button triggers immediate execution
- [ ] Delete button removes the job
- [ ] Create Job modal works (name, schedule, department, prompt)
- [ ] Department filter works
- [ ] Jobs auto-refresh every 15 seconds
- [ ] "Setup" button creates all default cron jobs

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: cron management page with enable/disable, create, run, delete"
```
