import { NextResponse } from "next/server";

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-key-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-key-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-key-32c" },
};

export async function GET() {
  const allJobs: Record<string, unknown>[] = [];

  for (const [dept, config] of Object.entries(PROFILES)) {
    try {
      const res = await fetch(`http://127.0.0.1:${config.port}/api/jobs`, {
        headers: { Authorization: `Bearer ${config.key}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : data.jobs || [];
        allJobs.push(...jobs.map((j: Record<string, unknown>) => ({ ...j, department: dept })));
      }
    } catch {
      // Profile not running, skip
    }
  }

  return NextResponse.json({ jobs: allJobs });
}
