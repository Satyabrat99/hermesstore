# PROMPT 16: Real Products + Deploy + Working E-commerce Flow

> This is the final push. Make the app functional and deployable.

---

In C:\Users\satya\HermesStore\frontend, make the products page show REAL Shopify products, set up the gateway proxy, and create a working e-commerce demo flow.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

Shopify store: hermes-mystore.myshopify.com
Access token: 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
API version: 2026-04

Gateway proxy exists at: src/app/api/gw/route.ts
Gateway ports: brain=8642, storeops=8643, marketing=8644, customer=8645

## Task 1: Create Shopify proxy route

Create `src/app/api/shopify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STORE = "hermes-mystore.myshopify.com";
const TOKEN = "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";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint") || "products.json";
  const limit = url.searchParams.get("limit") || "20";

  try {
    const res = await fetch(`https://${STORE}/admin/api/2026-04/${endpoint}?limit=${limit}`, {
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Shopify API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = body.endpoint || "products.json";

    const res = await fetch(`https://${STORE}/admin/api/2026-04/${endpoint}`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

## Task 2: Update Products page to show REAL data

Replace `src/app/products/page.tsx` to fetch from `/api/shopify?endpoint=products.json`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, Plus, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  status: string;
  tags: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
    inventory_management: string | null;
  }>;
  images: Array<{
    src: string;
    alt: string | null;
  }>;
  image?: {
    src: string;
    alt: string | null;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify?endpoint=products.json&limit=50");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      p.status === filter ||
      p.product_type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const categories = ["all", ...new Set(products.map((p) => p.product_type).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {products.length} products from hermes-mystore.myshopify.com
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} className="border-zinc-700 text-zinc-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/products/add">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              className={filter === cat ? "bg-blue-600 text-white" : "border-zinc-800 text-zinc-400"}
            >
              {cat === "all" ? "All" : cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
          <p className="text-zinc-500 mt-2">Loading products from Shopify...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const price = product.variants?.[0]?.price || "0";
            const compareAt = product.variants?.[0]?.compare_at_price;
            const stock = product.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) || 0;
            const imageUrl = product.image?.src || product.images?.[0]?.src;
            const discount = compareAt ? Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100) : 0;

            return (
              <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <div className="aspect-square bg-zinc-800 relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      -{discount}%
                    </Badge>
                  )}
                  <Badge
                    className={`absolute top-2 left-2 ${
                      product.status === "active"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                    }`}
                    variant="outline"
                  >
                    {product.status}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white mb-1 truncate">{product.title}</h3>
                  <p className="text-xs text-zinc-500 mb-2">{product.vendor || product.product_type}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">₹{parseFloat(price).toLocaleString("en-IN")}</span>
                      {compareAt && (
                        <span className="text-xs text-zinc-500 line-through">₹{parseFloat(compareAt).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    <span className={`text-xs ${stock < 10 ? "text-red-400" : "text-zinc-500"}`}>
                      {stock} in stock
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

## Task 3: Make the Add Product page create REAL products in Shopify

Update `src/app/products/add/page.tsx` to actually call the Shopify API to create products. When user fills in the form and clicks "Create Product", it should:

1. POST to `/api/shopify` with `{ endpoint: "products.json", data: { product: { title, body_html, product_type, variants: [{ price }] } } }`
2. Show success/error message
3. Link to view the product in Shopify admin

The form should have:
- Title input
- Description textarea
- Price input (₹)
- Category dropdown (sneakers, apparel, accessories, home-living, electronics, other)
- "Create Product" button

After creation, show: "✅ Product created! [View in Shopify]" with link to `https://hermes-mystore.myshopify.com/admin/products/{id}`

## Task 4: Update Dashboard with REAL metrics

Update `src/app/page.tsx` to fetch real data:
1. GET `/api/shopify?endpoint=products.json` → count products
2. GET `/api/shopify?endpoint/orders.json` → count orders, total revenue
3. Show these as real metrics, not mock data

If Shopify API fails, show "Connect Shopify in Settings" message.

## Task 5: Create a simple deployment script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
# Build and prepare for deployment
cd C:\Users\satya\HermesStore\frontend
npm run build
echo "Build complete. Ready for deployment."
echo "To deploy to Cloudflare Pages:"
echo "  npx wrangler pages deploy .next --project-name hermesstore"
echo "Or to deploy to Vercel:"
echo "  npx vercel --prod"
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
rm -rf .next
npm run build
```

Then:
1. Start gateways (user has them running)
2. Start frontend: `npm run start`
3. Open http://localhost:3000/products → real Shopify products visible
4. Click "Add Product" → fill form → product created in Shopify
5. Dashboard shows real product count

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add -A
git commit -m "feat: real Shopify products, add product flow, real dashboard metrics"
```
