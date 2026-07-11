"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { Package, MoreHorizontal } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-colors">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">
            -{discount}%
          </Badge>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 bg-zinc-900/80 rounded-md hover:bg-zinc-800">
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-white truncate">{product.title}</h3>
          <Badge variant="outline" className={`text-xs ${statusColors[product.status]}`}>
            {product.status}
          </Badge>
        </div>

        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">₹{product.price.toLocaleString()}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-zinc-500 line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 text-zinc-500" />
            <span className={`text-xs ${product.inventory < 10 ? "text-red-500" : "text-zinc-500"}`}>
              {product.inventory} in stock
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] border-zinc-800 text-zinc-500">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
