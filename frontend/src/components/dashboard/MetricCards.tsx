"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IndianRupee, ShoppingCart, Package, Users, AlertCircle } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}

interface MetricsState {
  products: number;
  orders: number;
  revenue: number;
  error: string | null;
  loading: boolean;
}

export function MetricCards() {
  const [state, setState] = useState<MetricsState>({
    products: 0,
    orders: 0,
    revenue: 0,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch("/api/shopify?endpoint=products.json&limit=250", { cache: "no-store" }),
          fetch("/api/shopify?endpoint=orders.json&limit=50&status=any", { cache: "no-store" }),
        ]);

        if (!prodRes.ok) throw new Error("Shopify products request failed");

        const prodData = await prodRes.json();
        const products = prodData.products?.length ?? 0;

        let orders = 0;
        let revenue = 0;
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          const ordersArr = orderData.orders ?? [];
          orders = ordersArr.length;
          revenue = ordersArr.reduce(
            (sum: number, o: { total_price?: string }) => sum + (parseFloat(o.total_price ?? "0") || 0),
            0
          );
        }

        setState({ products, orders, revenue, error: null, loading: false });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load Shopify data";
        setState((s) => ({ ...s, error: message, loading: false }));
      }
    };
    load();
  }, []);

  if (state.error) {
    return (
      <Card className="bg-red-500/5 border-red-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Could not reach Shopify — {state.error}. Connect Shopify in Settings.
        </div>
      </Card>
    );
  }

  const inr = (n: number) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

  const metrics: Metric[] = [
    {
      label: "Revenue",
      value: state.loading ? "…" : inr(state.revenue),
      sub: "from real orders",
      icon: <IndianRupee className="w-5 h-5" />,
    },
    {
      label: "Orders",
      value: state.loading ? "…" : String(state.orders),
      sub: "real Shopify orders",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: "Products",
      value: state.loading ? "…" : String(state.products),
      sub: "live in store",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Avg. Order",
      value: state.loading ? "…" : inr(state.orders ? state.revenue / state.orders : 0),
      sub: "per order",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-obsidian border-charcoal rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">{metric.label}</span>
            <span className="text-smoke">{metric.icon}</span>
          </div>
          <div className="text-2xl font-medium text-snow">{metric.value}</div>
          <div className="text-xs text-smoke mt-1">{metric.sub}</div>
        </Card>
      ))}
    </div>
  );
}
