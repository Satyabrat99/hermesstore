import { NextRequest, NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";
const HERMES_BIN = path.join(PROJECT_DIR, "hermes-agent", ".venv", "Scripts", "hermes.exe");

const AGENTS: Record<string, { port: number; homeDir: string; name: string }> = {
  brain: { port: 8642, homeDir: ".hermes-brain", name: "Brain" },
  storeops: { port: 8643, homeDir: ".hermes-storeops", name: "Store Ops" },
  marketing: { port: 8644, homeDir: ".hermes-marketing", name: "Marketing" },
  customer: { port: 8645, homeDir: ".hermes-customer", name: "Customer/Brand" },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await req.json();
  const agent = AGENTS[id];

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (action === "start") {
    try {
      const res = await fetch(`http://127.0.0.1:${agent.port}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return NextResponse.json({ success: true, message: "Already running" });
      }
    } catch {}

    const hermesHome = path.join(PROJECT_DIR, agent.homeDir);
    const child = spawn(HERMES_BIN, ["gateway"], {
      env: { ...process.env, HERMES_HOME: hermesHome },
      detached: true,
      stdio: "ignore",
      cwd: PROJECT_DIR,
    });
    child.unref();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const res = await fetch(`http://127.0.0.1:${agent.port}/health`, {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          logActivity(id, `${agent.name} started`, "info");
          return NextResponse.json({ success: true, message: "Started" });
        }
      } catch {}
    }

    return NextResponse.json({ error: "Failed to start — timeout" }, { status: 500 });
  }

  if (action === "stop") {
    try {
      const { stdout } = await execAsync(
        `netstat -ano | findstr ":${agent.port}" | findstr "LISTENING"`
      ).catch(() => ({ stdout: "" }));
      const match = stdout.trim().match(/\s+(\d+)\s*$/);
      if (match) {
        const pid = match[1];
        await execAsync(`taskkill /PID ${pid} /F`).catch(() => {});
        logActivity(id, `${agent.name} stopped`, "info");
        return NextResponse.json({ success: true, message: "Stopped" });
      }
      return NextResponse.json({ success: true, message: "Was not running" });
    } catch {
      return NextResponse.json({ error: "Failed to stop" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

function logActivity(agentId: string, message: string, level: string) {
  const logPath = path.join(PROJECT_DIR, `.hermes-${agentId}`, "activity.log");
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    level,
    agent: agentId,
  });
  fs.appendFileSync(logPath, entry + "\n");
}
