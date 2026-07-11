"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Key,
  Palette,
  Plug,
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
