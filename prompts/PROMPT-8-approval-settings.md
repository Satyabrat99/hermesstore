# PROMPT 8: Approval Flow + Settings Page

> Feed this to Command Code after Prompt 7 is verified.

---

In C:\Users\satya\HermesStore\frontend, add an approval dialog component for destructive actions and a basic Settings page.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

All pages exist. The app needs an approval flow for actions like price changes and publishing.

## What to Build

### 1. Create ApprovalDialog component

Create `src/components/ui/approval-dialog.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface ApprovalDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  action: string;
  details?: { label: string; value: string }[];
  risk?: "low" | "medium" | "high";
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const riskColors = {
  low: "border-green-500/20 bg-green-500/5",
  medium: "border-yellow-500/20 bg-yellow-500/5",
  high: "border-red-500/20 bg-red-500/5",
};

export function ApprovalDialog({
  isOpen,
  title,
  description,
  action,
  details,
  risk = "medium",
  onApprove,
  onReject,
  isLoading,
}: ApprovalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`w-full max-w-md mx-4 p-0 ${riskColors[risk]} border`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
              </div>
            </div>
            <button onClick={onReject} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {details && details.length > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-3 mb-4 space-y-2">
              {details.map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{d.label}</span>
                  <span className="text-white font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReject}
              className="flex-1 border-zinc-700 text-zinc-300"
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : action}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 2. Create Settings page

Create `src/app/settings/page.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Store,
  Key,
  Palette,
  Bell,
  Plug,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "hermesstore-dev-2026";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure your store, integrations, and preferences
        </p>
      </div>

      {/* Store Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-white">Store</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Store Name</label>
            <Input defaultValue="HermesStore Demo" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Shopify Domain</label>
            <Input defaultValue="hermesstore-demo.myshopify.com" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Currency</label>
            <Input defaultValue="INR (₹)" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        </div>
      </Card>

      {/* API Connection */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-green-500" />
          <h2 className="text-base font-semibold text-white">Hermes API</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">API Endpoint</label>
            <div className="flex gap-2">
              <Input defaultValue="http://localhost:8642" className="bg-zinc-800 border-zinc-700 text-white flex-1" readOnly />
              <Badge variant="outline" className="border-green-500/20 text-green-500 self-center">
                <Check className="w-3 h-3 mr-1" /> Connected
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                defaultValue={apiKey}
                className="bg-zinc-800 border-zinc-700 text-white flex-1"
                readOnly
              />
              <Button variant="outline" size="sm" onClick={handleCopy} className="border-zinc-700 text-zinc-300">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Integrations */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Plug className="w-5 h-5 text-purple-500" />
          <h2 className="text-base font-semibold text-white">Integrations</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {[
            { name: "Shopify", status: "connected", desc: "Store operations, products, orders" },
            { name: "OpenAI", status: "connected", desc: "GPT-5.5 for agent intelligence" },
            { name: "Dodo Payments", status: "not_connected", desc: "Payment processing" },
            { name: "ElevenLabs", status: "not_connected", desc: "Voice synthesis" },
            { name: "Cloudflare", status: "not_connected", desc: "Hosting & deployment" },
            { name: "Linkup", status: "not_connected", desc: "Competitor intelligence" },
          ].map((integration) => (
            <div key={integration.name} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{integration.name}</p>
                <p className="text-xs text-zinc-500">{integration.desc}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  integration.status === "connected"
                    ? "border-green-500/20 text-green-500"
                    : "border-zinc-700 text-zinc-500"
                }
              >
                {integration.status === "connected" ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Brand Voice */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-500" />
          <h2 className="text-base font-semibold text-white">Brand Voice</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Tone</label>
            <Input defaultValue="Friendly, professional, concise" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Brand Colors</label>
            <div className="flex gap-2">
              {["#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 rounded-lg border border-zinc-700"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Description</label>
            <textarea
              defaultValue="Modern Indian ecommerce brand. Premium quality at fair prices. Fast shipping, excellent support."
              className="w-full h-20 bg-zinc-800 border-zinc-700 text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 3. Add Settings to sidebar navigation

Update `src/components/chat/ChatSidebar.tsx` to add Settings link:

Add to the navigation array:
```tsx
{ href: "/settings", label: "Settings", icon: Settings },
```

Import `Settings` from lucide-react.

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] ApprovalDialog renders as a modal overlay with approve/reject buttons
- [ ] /settings shows 4 settings cards: Store, API, Integrations, Brand Voice
- [ ] Settings link appears in sidebar navigation
- [ ] API key copy button works
- [ ] Integration status badges (connected/not connected)

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: approval dialog component, settings page, sidebar nav update"
```
