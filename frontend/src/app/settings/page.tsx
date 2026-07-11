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
        <h1 className="text-2xl font-medium text-snow">Settings</h1>
        <p className="text-sm text-silver mt-1">
          Configure your store, integrations, and preferences
        </p>
      </div>

      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Store className="w-5 h-5 text-phosphor" />
          <h2 className="text-base font-medium text-snow">Store</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-silver mb-1 block">Store Name</label>
            <Input defaultValue="HermesStore Demo" className="bg-ash border-slate text-snow rounded-full focus:border-phosphor" />
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Shopify Domain</label>
            <Input defaultValue="hermesstore-demo.myshopify.com" className="bg-ash border-slate text-snow rounded-full focus:border-phosphor" />
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Currency</label>
            <Input defaultValue="INR (₹)" className="bg-ash border-slate text-snow rounded-full focus:border-phosphor" />
          </div>
        </div>
      </Card>

      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Key className="w-5 h-5 text-phosphor" />
          <h2 className="text-base font-medium text-snow">Hermes API</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-silver mb-1 block">API Endpoint</label>
            <div className="flex gap-2">
              <Input defaultValue="http://localhost:8642" className="bg-ash border-slate text-snow rounded-full flex-1" readOnly />
              <Badge variant="outline" className="border-phosphor/20 text-phosphor self-center rounded-full">
                <Check className="w-3 h-3 mr-1" /> Connected
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                defaultValue={apiKey}
                className="bg-ash border-slate text-snow rounded-full flex-1"
                readOnly
              />
              <Button variant="outline" size="sm" onClick={handleCopy} className="border-charcoal text-silver rounded-full">
                {copied ? <Check className="w-4 h-4 text-phosphor" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Plug className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-medium text-snow">Integrations</h2>
        </div>
        <div className="divide-y divide-charcoal">
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
                <p className="text-sm font-medium text-snow">{integration.name}</p>
                <p className="text-xs text-smoke">{integration.desc}</p>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full ${
                  integration.status === "connected"
                    ? "border-phosphor/20 text-phosphor"
                    : "border-charcoal text-smoke"
                }`}
              >
                {integration.status === "connected" ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" />
          <h2 className="text-base font-medium text-snow">Brand Voice</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-silver mb-1 block">Tone</label>
            <Input defaultValue="Friendly, professional, concise" className="bg-ash border-slate text-snow rounded-full focus:border-phosphor" />
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Brand Colors</label>
            <div className="flex gap-2">
              {["#3ecf8e", "#1f4b37", "#006239", "#121212"].map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 rounded-full border border-charcoal"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Description</label>
            <textarea
              defaultValue="Modern Indian ecommerce brand. Premium quality at fair prices. Fast shipping, excellent support."
              className="w-full h-20 bg-ash border border-slate text-snow rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-phosphor"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
