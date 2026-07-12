"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Check, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "sneakers",
  "apparel",
  "accessories",
  "home-living",
  "electronics",
  "other",
];

interface CreatedProduct {
  id: number;
  title: string;
}

export default function AddProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("sneakers");
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState<CreatedProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !price.trim()) {
      setError("Title and price are required.");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "products.json",
          data: {
            product: {
              title: title.trim(),
              body_html: description.trim(),
              product_type: category,
              status: "active",
              variants: [{ price: price.trim() }],
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Shopify error: ${res.status}`);
      }
      const product = data.product;
      if (!product?.id) {
        throw new Error("Product created but no ID returned.");
      }
      setCreated({ id: product.id, title: product.title });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create product";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (created) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="bg-obsidian border-charcoal rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-phosphor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-phosphor" />
          </div>
          <h2 className="text-xl font-medium text-snow mb-2">Product Created!</h2>
          <p className="text-silver mb-6">
            &quot;{created.title}&quot; is now live in your Shopify store.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/products">
              <Button variant="outline" className="border-charcoal text-silver rounded-full">
                View Products
              </Button>
            </Link>
            <a
              href={`https://hermes-mystore.myshopify.com/admin/products/${created.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium">
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Shopify
              </Button>
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCreated(null);
              setTitle("");
              setDescription("");
              setPrice("");
              setCategory("sneakers");
            }}
            className="mt-6 text-smoke hover:text-snow"
          >
            Add Another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="text-smoke hover:text-snow">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-snow">Add Product</h1>
          <p className="text-sm text-silver mt-1">
            Create a real product in your Shopify store
          </p>
        </div>
      </div>

      <Card className="bg-obsidian border-charcoal rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-sm text-silver mb-2 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Nike Air Max 90"
            className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
          />
        </div>

        <div>
          <label className="text-sm text-silver mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product..."
            className="w-full h-28 bg-ash border border-slate text-snow rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-phosphor"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-silver mb-2 block">Price (₹)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="8999"
              className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
            />
          </div>
          <div>
            <label className="text-sm text-silver mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 bg-ash border border-slate text-snow rounded-full px-4 text-sm focus:outline-none focus:border-phosphor"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </Card>

      <p className="text-xs text-smoke text-center">
        Products are pushed directly to hermes-mystore.myshopify.com
      </p>
    </div>
  );
}
