"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { mockProducts } from "@/lib/mock-data";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Sneakers", "Apparel", "Home & Living", "Accessories"];
const statuses = ["All", "Active", "Draft", "Archived"];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = mockProducts.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCategory = category === "All" || p.category === category;
    const matchesStatus = status === "All" || p.status === status.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-snow">Products</h1>
          <p className="text-sm text-silver mt-1">
            {mockProducts.length} products · {mockProducts.filter((p) => p.status === "active").length} active
          </p>
        </div>
        <Link href="/products/add">
          <Button className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or tag..."
            className="pl-9 bg-ash border-slate text-snow rounded-full focus:border-phosphor"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className={
                category === cat
                  ? "bg-phosphor text-obsidian rounded-full"
                  : "border-charcoal text-silver hover:bg-ash rounded-full"
              }
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "bg-ash text-snow rounded-full"
                : "border-charcoal text-silver hover:bg-ash rounded-full"
            }
          >
            {s}
          </Button>
        ))}
        <span className="ml-auto text-sm text-smoke self-center">
          {filtered.length} products shown
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-smoke">No products match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
