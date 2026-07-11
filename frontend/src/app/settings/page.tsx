"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "hermesstore-app-2026-secret-key-32c";

  // Shopify connection state
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [shopifyClientId, setShopifyClientId] = useState("");
  const [shopifySecret, setShopifySecret] = useState("");
  const [shopifyConfigured, setShopifyConfigured] = useState(false);
  const [shopifyHasSecret, setShopifyHasSecret] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Gateway restart state
  const [restartLoading, setRestartLoading] = useState(false);
  const [restartResult, setRestartResult] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load current Shopify config on mount
  useEffect(() => {
    fetch("/api/settings/shopify")
      .then((r) => r.json())
      .then((data) => {
        setShopifyConfigured(data.configured || false);
        if (data.configured) {
          setShopifyDomain(data.storeDomain || "");
          setShopifyClientId(data.clientId || "");
          setShopifyHasSecret(data.hasSecret || false);
        }
      })
      .catch(() => {});
  }, []);

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeDomain: shopifyDomain, clientSecret: shopifySecret }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ type: "success", message: data.message });
      } else {
        setTestResult({ type: "error", message: data.error });
      }
    } catch (err) {
      setTestResult({ type: "error", message: "Request failed" });
    }
    setTestLoading(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/settings/shopify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeDomain: shopifyDomain,
          clientId: shopifyClientId,
          clientSecret: shopifySecret,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult({ type: "success", message: data.message });
        setShopifyConfigured(true);
        setShopifyHasSecret(true);
      } else {
        setSaveResult({ type: "error", message: data.error });
      }
    } catch {
      setSaveResult({ type: "error", message: "Request failed" });
    }
    setSaveLoading(false);
  };

  const handleRestart = async () => {
    setRestartLoading(true);
    setRestartResult(null);
    try {
      const res = await fetch("/api/gateway/restart", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const running = data.agents?.filter((a: { status: string }) => a.status === "running").length || 0;
        setRestartResult(`${running}/${data.agents?.length || 4} gateways restarted successfully.`);
      } else {
        setRestartResult(`Error: ${data.error}`);
      }
    } catch {
      setRestartResult("Restart request failed");
    }
    setRestartLoading(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium text-snow">Settings</h1>
        <p className="text-sm text-silver mt-1">
          Configure your store, integrations, and preferences
        </p>
      </div>

      {/* Store Settings */}
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

      {/* API Connection */}
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

      {/* Shopify Connection */}
      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Plug className="w-5 h-5 text-phosphor" />
          <h2 className="text-base font-medium text-snow">Shopify Connection</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${shopifyConfigured ? "bg-phosphor" : "bg-smoke"}`} />
            <span className="text-sm text-silver">
              {shopifyConfigured
                ? `Connected to ${shopifyDomain}`
                : "Not configured"}
            </span>
          </div>

          <div>
            <label className="text-sm text-silver mb-1 block">Store Domain</label>
            <Input
              value={shopifyDomain}
              onChange={(e) => setShopifyDomain(e.target.value)}
              placeholder="store-name.myshopify.com"
              className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
            />
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Client ID</label>
            <Input
              value={shopifyClientId}
              onChange={(e) => setShopifyClientId(e.target.value)}
              placeholder="shpat_xxxxx"
              className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
            />
          </div>
          <div>
            <label className="text-sm text-silver mb-1 block">Client Secret (Access Token)</label>
            <Input
              type="password"
              value={shopifySecret}
              onChange={(e) => setShopifySecret(e.target.value)}
              placeholder={shopifyHasSecret ? "••••••••••••••••" : "shpat_xxxxx"}
              className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testLoading || !shopifyDomain || !shopifySecret}
              className="border-charcoal text-silver rounded-full"
            >
              {testLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-1" />}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveLoading || !shopifyDomain || !shopifyClientId || !shopifySecret}
              className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
            >
              {saveLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Save & Connect
            </Button>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${
              testResult.type === "success"
                ? "bg-phosphor/10 text-phosphor"
                : "bg-red-500/10 text-red-400"
            }`}>
              {testResult.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {testResult.message}
            </div>
          )}

          {saveResult && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${
              saveResult.type === "success"
                ? "bg-phosphor/10 text-phosphor"
                : "bg-red-500/10 text-red-400"
            }`}>
              {saveResult.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {saveResult.message}
            </div>
          )}
        </div>
      </Card>

      {/* Other Integrations */}
      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <Plug className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-medium text-snow">Other Integrations</h2>
        </div>
        <div className="divide-y divide-charcoal">
          {[
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

      {/* Brand Voice */}
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

      {/* Gateway Management */}
      <Card className="bg-obsidian border-charcoal rounded-2xl">
        <div className="p-4 border-b border-charcoal flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-phosphor" />
          <h2 className="text-base font-medium text-snow">Gateway Management</h2>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-silver">
            Restart all agent gateways to apply config changes.
          </p>
          <Button
            onClick={handleRestart}
            disabled={restartLoading}
            className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
          >
            {restartLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-1" />}
            Restart All Gateways
          </Button>
          {restartResult && (
            <div className="text-sm text-silver mt-2">{restartResult}</div>
          )}
          <p className="text-xs text-smoke">
            This will briefly interrupt all agent connections.
          </p>
        </div>
      </Card>
    </div>
  );
}
