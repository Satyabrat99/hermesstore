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
