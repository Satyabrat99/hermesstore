"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { Package, MoreHorizontal } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const statusColors = {
  active: "bg-phosphor/10 text-phosphor border-phosphor/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  archived: "bg-smoke/10 text-smoke border-smoke/20",
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Card className="bg-obsidian border-charcoal rounded-2xl overflow-hidden group hover:border-graphite transition-colors">
      <div className="relative aspect-square bg-ash">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-phosphor text-obsidian border-0 rounded-full font-medium">
            -{discount}%
          </Badge>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 bg-obsidian/80 rounded-full hover:bg-ash">
            <MoreHorizontal className="w-4 h-4 text-snow" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-snow truncate">{product.title}</h3>
          <Badge variant="outline" className={`text-xs rounded-full ${statusColors[product.status]}`}>
            {product.status}
          </Badge>
        </div>

        <p className="text-xs text-smoke mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-snow">₹{product.price.toLocaleString()}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-smoke line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 text-smoke" />
            <span className={`text-xs ${product.inventory < 10 ? "text-red-500" : "text-smoke"}`}>
              {product.inventory} in stock
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] border-charcoal text-smoke rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
