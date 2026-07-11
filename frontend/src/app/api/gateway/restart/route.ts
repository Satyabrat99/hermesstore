import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PROFILES = [
  { name: "brain", home: ".hermes-brain", port: 8642 },
  { name: "storeops", home: ".hermes-storeops", port: 8643 },
  { name: "marketing", home: ".hermes-marketing", port: 8644 },
  { name: "customer", home: ".hermes-customer", port: 8645 },
];

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";
const HERMES_BIN = `${PROJECT_DIR}\\hermes-agent\\.venv\\Scripts\\hermes.exe`;

export async function POST() {
  try {
    // Kill existing gateways on ports 8642-8645
    for (const port of [8642, 8643, 8644, 8645]) {
      try {
        const { stdout } = await execAsync(
          `netstat -ano | findstr ":${port}" | findstr "LISTENING"`
        ).catch(() => ({ stdout: "" }));
        const match = stdout.trim().match(/\s+(\d+)\s*$/);
        if (match) {
          await execAsync(`taskkill /PID ${match[1]} /F`).catch(() => {});
        }
      } catch {}
    }

    await new Promise((r) => setTimeout(r, 2000));

    // Start each gateway
    for (const p of PROFILES) {
      const hermesHome = `${PROJECT_DIR}\\${p.home}`;
      const child = exec(
        `set "HERMES_HOME=${hermesHome}" && "${HERMES_BIN}" gateway`,
        { cwd: PROJECT_DIR }
      );
      if (child.pid) child.unref();
    }

    // Wait for them to start
    await new Promise((r) => setTimeout(r, 15000));

    // Health check
    const results = [];
    for (const p of PROFILES) {
      try {
        const res = await fetch(`http://127.0.0.1:${p.port}/health`, {
          signal: AbortSignal.timeout(5000),
        });
        results.push({ name: p.name, status: res.ok ? "running" : "failed" });
      } catch {
        results.push({ name: p.name, status: "failed" });
      }
    }

    return NextResponse.json({ success: true, agents: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
