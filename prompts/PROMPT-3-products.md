# PROMPT 3: Products Page (Grid + Search + Filters)

> Feed this to Command Code after Prompt 2 is verified.

---

In C:\Users\satya\HermesStore\frontend, build the Products page with a product grid, search bar, filters, and product cards.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

The app already has:
- Next.js 15 + Tailwind v4 + shadcn/ui (dark theme)
- Chat sidebar (persistent, left side)
- Dashboard page with metric cards, agent activity, alerts, quick actions
- Components: Card, Badge, Button, Input from shadcn/ui

## What to Build

### 1. Create product types

Create `src/lib/types.ts`:

```typescript
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  status: "active" | "draft" | "archived";
  inventory: number;
  image: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  createdAt: string;
}
```

### 2. Create mock product data

Create `src/lib/mock-data.ts`:

```typescript
import { Product, Order } from "./types";

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Nike Air Max 90",
    description: "Classic Nike Air Max 90 in white/black colorway. Premium leather upper with visible Air cushioning.",
    price: 8999,
    compareAtPrice: 12999,
    category: "Sneakers",
    status: "active",
    inventory: 45,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Nike+Air+Max",
    tags: ["nike", "sneakers", "bestseller"],
    createdAt: "2026-07-01",
    updatedAt: "2026-07-10",
  },
  {
    id: "2",
    title: "Adidas Ultraboost 22",
    description: "Responsive Boost midsole. Primeknit upper for adaptive support.",
    price: 7499,
    compareAtPrice: 9999,
    category: "Sneakers",
    status: "active",
    inventory: 32,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Adidas+UB",
    tags: ["adidas", "sneakers", "running"],
    createdAt: "2026-07-02",
    updatedAt: "2026-07-09",
  },
  {
    id: "3",
    title: "Handmade Jaipur Pottery Set",
    description: "Set of 4 handcrafted ceramic cups from Jaipur. Traditional blue pottery design.",
    price: 1299,
    category: "Home & Living",
    status: "active",
    inventory: 18,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Pottery+Set",
    tags: ["handmade", "jaipur", "pottery", "bestseller"],
    createdAt: "2026-07-03",
    updatedAt: "2026-07-11",
  },
  {
    id: "4",
    title: "Puma RS-X Reinvention",
    description: "Bold chunky silhouette with RS technology. Retro-futuristic design.",
    price: 5999,
    compareAtPrice: 7999,
    category: "Sneakers",
    status: "active",
    inventory: 8,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Puma+RS-X",
    tags: ["puma", "sneakers", "sale"],
    createdAt: "2026-07-04",
    updatedAt: "2026-07-08",
  },
  {
    id: "5",
    title: "Organic Cotton T-Shirt",
    description: "Premium organic cotton. Relaxed fit. Available in 6 colors.",
    price: 899,
    category: "Apparel",
    status: "active",
    inventory: 120,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Cotton+Tee",
    tags: ["organic", "cotton", "apparel"],
    createdAt: "2026-07-05",
    updatedAt: "2026-07-10",
  },
  {
    id: "6",
    title: "Leather Messenger Bag",
    description: "Full grain leather. Brass hardware. Fits 15-inch laptop.",
    price: 3499,
    compareAtPrice: 4999,
    category: "Accessories",
    status: "draft",
    inventory: 0,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Leather+Bag",
    tags: ["leather", "bag", "accessories"],
    createdAt: "2026-07-06",
    updatedAt: "2026-07-11",
  },
  {
    id: "7",
    title: "New Balance 574",
    description: "Iconic silhouette. ENCAP midsole technology. suede/mesh upper.",
    price: 6499,
    category: "Sneakers",
    status: "active",
    inventory: 25,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=NB+574",
    tags: ["new balance", "sneakers", "classic"],
    createdAt: "2026-07-07",
    updatedAt: "2026-07-09",
  },
  {
    id: "8",
    title: "Reebok Club C 85",
    description: "Clean low-top design. Soft leather upper. Timeless court style.",
    price: 4999,
    compareAtPrice: 6999,
    category: "Sneakers",
    status: "active",
    inventory: 3,
    image: "https://placehold.co/400x400/1a1a2e/ffffff?text=Reebok+Club",
    tags: ["reebok", "sneakers", "sale"],
    createdAt: "2026-07-08",
    updatedAt: "2026-07-10",
  },
];

export const mockOrders: Order[] = [
  { id: "1", orderNumber: "#1001", customer: "Rahul Sharma", total: 8999, status: "delivered", items: 1, createdAt: "2026-07-10" },
  { id: "2", orderNumber: "#1002", customer: "Priya Patel", total: 2498, status: "shipped", items: 2, createdAt: "2026-07-10" },
  { id: "3", orderNumber: "#1003", customer: "Amit Kumar", total: 7499, status: "processing", items: 1, createdAt: "2026-07-11" },
  { id: "4", orderNumber: "#1004", customer: "Sneha Gupta", total: 5398, status: "pending", items: 3, createdAt: "2026-07-11" },
  { id: "5", orderNumber: "#1005", customer: "Vikram Singh", total: 8999, status: "pending", items: 1, createdAt: "2026-07-11" },
];
```

### 3. Create ProductCard component

Create `src/components/products/ProductCard.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { Package, Edit, MoreHorizontal } from "lucide-react";

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
```

### 4. Create Products page

Create `src/app/products/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { mockProducts } from "@/lib/mock-data";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {mockProducts.length} products · {mockProducts.filter((p) => p.status === "active").length} active
          </p>
        </div>
        <Link href="/products/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or tag..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className={
                category === cat
                  ? "bg-blue-600 text-white"
                  : "border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "bg-zinc-700 text-white"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }
          >
            {s}
          </Button>
        ))}
        <span className="ml-auto text-sm text-zinc-500 self-center">
          {filtered.length} products shown
        </span>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No products match your filters.</p>
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
```

### 5. Add navigation link in sidebar

Update `src/components/chat/ChatSidebar.tsx` to add navigation links at the top of the sidebar (above the chat). Add this BEFORE the chat messages section:

```tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Megaphone, Bot } from "lucide-react";
```

Add this inside the ChatSidebar component, between the header and the MessageList:

```tsx
{/* Navigation */}
<div className="p-2 border-b border-zinc-800">
  <nav className="flex flex-col gap-1">
    {[
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/products", label: "Products", icon: Package },
      { href: "/marketing", label: "Marketing", icon: Megaphone },
      { href: "/agents", label: "Agents", icon: Bot },
    ].map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            isActive
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Icon className="w-4 h-4" />
          {item.label}
        </Link>
      );
    })}
  </nav>
</div>
```

Make sure to add `const pathname = usePathname();` at the top of the component.

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /products shows 8 product cards in a grid
- [ ] Search filters by product name and tags
- [ ] Category filter works (All, Sneakers, Apparel, etc.)
- [ ] Status filter works (All, Active, Draft)
- [ ] Product cards show: image, title, price, compare-at-price, discount badge, inventory, tags
- [ ] "Add Product" button links to /products/add
- [ ] Sidebar navigation shows Dashboard, Products, Marketing, Agents
- [ ] Active nav item is highlighted

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: products page with grid, search, filters, sidebar navigation"
```
