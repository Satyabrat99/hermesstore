import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROJECT_DIR = "C:\\Users\\satya\\HermesStore";

const AGENTS: Record<string, string> = {
  brain: ".hermes-brain",
  storeops: ".hermes-storeops",
  marketing: ".hermes-marketing",
  customer: ".hermes-customer",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const homeDir = AGENTS[id];
  if (!homeDir) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const soulPath = path.join(PROJECT_DIR, homeDir, "SOUL.md");
  const content = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, "utf-8") : "";

  return NextResponse.json({ content, path: soulPath });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const homeDir = AGENTS[id];
  if (!homeDir) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const { content } = await req.json();
  const soulPath = path.join(PROJECT_DIR, homeDir, "SOUL.md");

  const backupPath = soulPath + ".backup." + Date.now();
  if (fs.existsSync(soulPath)) {
    fs.copyFileSync(soulPath, backupPath);
  }

  fs.writeFileSync(soulPath, content, "utf-8");

  return NextResponse.json({
    success: true,
    message: "SOUL.md updated. Restart agent to apply.",
  });
}
