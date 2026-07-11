import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROFILES: Record<string, { port: number; key: string }> = {
  brain: { port: 8642, key: "hermesstore-brain-2026-secret-key-32c" },
  storeops: { port: 8643, key: "hermesstore-storeops-2026-secret-32c" },
  marketing: { port: 8644, key: "hermesstore-marketing-2026-secret-32c" },
  customer: { port: 8645, key: "hermesstore-customer-2026-secret-32c" },
};

export async function GET() {
  const allJobs: Record<string, unknown>[] = [];
  const errors: string[] = [];

  for (const [dept, config] of Object.entries(PROFILES)) {
    const url = `http://127.0.0.1:${config.port}/api/jobs?_t=${Date.now()}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : data.jobs || [];
        allJobs.push(...jobs.map((j: Record<string, unknown>) => ({ ...j, department: dept })));
      } else {
        errors.push(`${dept}: HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${dept}: ${message}`);
    }
  }

  return NextResponse.json(
    { jobs: allJobs, errors },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
