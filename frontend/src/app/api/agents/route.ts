import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";

interface AgentConfig {
  id: string;
  name: string;
  department: string;
  port: number;
  homeDir: string;
  description: string;
}

const AGENTS: AgentConfig[] = [
  { id: "brain", name: "Brain (Orchestrator)", department: "brain", port: 8642, homeDir: ".hermes-brain", description: "Routes requests to departments" },
  { id: "storeops", name: "Store Ops", department: "storeops", port: 8643, homeDir: ".hermes-storeops", description: "Products, pricing, inventory, SEO" },
  { id: "marketing", name: "Marketing", department: "marketing", port: 8644, homeDir: ".hermes-marketing", description: "Social media, content, campaigns" },
  { id: "customer", name: "Customer/Brand", department: "customer-brand", port: 8645, homeDir: ".hermes-customer", description: "Support, brand voice, copywriting" },
];

export async function GET() {
  const agents = await Promise.all(
    AGENTS.map(async (agent) => {
      const isRunning = await checkHealth(agent.port);
      const soulPath = path.join(PROJECT_DIR, agent.homeDir, "SOUL.md");
      const soulContent = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, "utf-8") : "";
      const logPath = path.join(PROJECT_DIR, agent.homeDir, "activity.log");
      const logs = fs.existsSync(logPath)
        ? fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean).slice(-20)
        : [];

      return {
        ...agent,
        status: isRunning ? "running" as const : "stopped" as const,
        soulPreview: soulContent.slice(0, 200),
        logs: logs.map(parseLogEntry),
      };
    })
  );

  return NextResponse.json({ agents });
}

async function checkHealth(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`curl -s -o nul -w "%{http_code}" --max-time 2 http://127.0.0.1:${port}/health`);
    return stdout.trim() === "200";
  } catch {
    return false;
  }
}

function parseLogEntry(line: string) {
  try {
    return JSON.parse(line);
  } catch {
    return { timestamp: new Date().toISOString(), message: line, level: "info" };
  }
}
