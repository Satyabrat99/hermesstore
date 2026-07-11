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

export interface Campaign {
  id: string;
  name: string;
  type: "social" | "email" | "ad";
  status: "active" | "scheduled" | "completed" | "draft";
  platform?: string;
  reach: number;
  engagement: number;
  conversions: number;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "linkedin";
  content: string;
  image?: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}
