# PROMPT 5: Marketing Page (Overview + Social + Campaigns)

> Feed this to Command Code after Prompt 4 is verified.

---

In C:\Users\satya\HermesStore\frontend, build the Marketing page with a campaign overview, social media section, and email campaign section.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

The app already has:
- Next.js 15 + Tailwind v4 + shadcn/ui (dark theme)
- Products page with product grid
- Add Product page with text/image/voice input
- Sidebar navigation (Dashboard, Products, Marketing, Agents)
- Mock data at src/lib/mock-data.ts
- Types at src/lib/types.ts

## What to Build

### 1. Add marketing types to src/lib/types.ts

Add these types to the existing types file:

```typescript
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
```

### 2. Add marketing mock data to src/lib/mock-data.ts

Append to the existing file:

```typescript
export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale 2026",
    type: "social",
    status: "active",
    platform: "Instagram",
    reach: 12500,
    engagement: 890,
    conversions: 47,
    createdAt: "2026-07-08",
  },
  {
    id: "2",
    name: "New Arrivals Email",
    type: "email",
    status: "completed",
    reach: 3200,
    engagement: 640,
    conversions: 23,
    createdAt: "2026-07-05",
  },
  {
    id: "3",
    name: "Google Shopping Ads",
    type: "ad",
    status: "active",
    platform: "Google",
    reach: 45000,
    engagement: 2100,
    conversions: 89,
    createdAt: "2026-07-01",
  },
  {
    id: "4",
    name: "Flash Sale Announcement",
    type: "social",
    status: "scheduled",
    platform: "Twitter",
    reach: 0,
    engagement: 0,
    conversions: 0,
    createdAt: "2026-07-11",
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    content: "🔥 Summer Sale is LIVE! Up to 40% off on all sneakers. Link in bio!",
    image: "https://placehold.co/600x600/1a1a2e/ffffff?text=Summer+Sale",
    status: "published",
    likes: 234,
    comments: 18,
    shares: 12,
  },
  {
    id: "2",
    platform: "twitter",
    content: "New drop alert 🚀 Handmade Jaipur Pottery now available. Each piece unique. #Handmade #Jaipur",
    status: "published",
    likes: 89,
    comments: 7,
    shares: 23,
  },
  {
    id: "3",
    platform: "instagram",
    content: "Behind the scenes: How our leather bags are made 🎥 Full reel coming soon!",
    image: "https://placehold.co/600x600/1a1a2e/ffffff?text=BTS+Reel",
    status: "scheduled",
    scheduledFor: "2026-07-12 09:00",
  },
  {
    id: "4",
    platform: "linkedin",
    content: "We're hiring! Looking for a growth marketer to join our team. DM for details.",
    status: "draft",
  },
];
```

### 3. Create Marketing page

Create `src/app/marketing/page.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCampaigns, mockSocialPosts } from "@/lib/mock-data";
import {
  Megaphone,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  TrendingUp,
  Users,
  MousePointerClick,
  Plus,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Send,
  BarChart3,
} from "lucide-react";

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors = {
  instagram: "text-pink-500",
  twitter: "text-blue-400",
  linkedin: "text-blue-600",
  facebook: "text-blue-500",
};

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  published: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function MarketingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage campaigns, social media, and email marketing
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reach", value: "60,700", icon: Users, change: "+18%" },
          { label: "Engagement", value: "3,630", icon: MousePointerClick, change: "+12%" },
          { label: "Conversions", value: "159", icon: TrendingUp, change: "+24%" },
          { label: "Active Campaigns", value: "2", icon: Megaphone, change: "" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">{stat.label}</span>
                <Icon className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              {stat.change && (
                <span className="text-xs text-green-500">{stat.change} this month</span>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaigns */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Campaigns</h2>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <BarChart3 className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="divide-y divide-zinc-800">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-zinc-800`}>
                      {campaign.type === "social" ? (
                        <Instagram className="w-4 h-4 text-pink-500" />
                      ) : campaign.type === "email" ? (
                        <Mail className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Megaphone className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{campaign.name}</p>
                      <p className="text-xs text-zinc-500">
                        {campaign.platform} · {campaign.type} · {campaign.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-white">{campaign.reach.toLocaleString()} reach</p>
                      <p className="text-xs text-zinc-500">{campaign.conversions} conversions</p>
                    </div>
                    <Badge variant="outline" className={statusColors[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Social Media Posts */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Social Media Posts</h2>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <Plus className="w-4 h-4 mr-2" />
                Generate Post
              </Button>
            </div>
            <div className="divide-y divide-zinc-800">
              {mockSocialPosts.map((post) => {
                const Icon = platformIcons[post.platform];
                const color = platformColors[post.platform];
                return (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white capitalize">
                            {post.platform}
                          </span>
                          <Badge variant="outline" className={statusColors[post.status]}>
                            {post.status}
                          </Badge>
                          {post.scheduledFor && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.scheduledFor}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">{post.content}</p>
                        {post.image && (
                          <div className="w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden mb-2">
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {post.status === "published" && (
                          <div className="flex gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" /> {post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" /> {post.shares}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Generate Instagram Post", icon: Instagram, color: "text-pink-500" },
                { label: "Create Email Campaign", icon: Mail, color: "text-blue-500" },
                { label: "Launch Ad Campaign", icon: Megaphone, color: "text-green-500" },
                { label: "Send Promo Message", icon: Send, color: "text-purple-500" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-white"
                  >
                    <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">AI Suggestions</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                "Post about your bestseller on Instagram — it's trending in your category",
                "Send a flash sale email to your 3,200 subscribers",
                "Your competitor dropped prices — consider a counter-campaign",
              ].map((suggestion, i) => (
                <div key={i} className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-300">{suggestion}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-xs text-blue-400 hover:text-blue-300 p-0"
                  >
                    Act on this →
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

## Verification

```bash
cd C:\Users\satya\HermesStore\frontend
npm run build
```

Check:
- [ ] Build succeeds
- [ ] /marketing shows marketing dashboard
- [ ] Stats row: Total Reach, Engagement, Conversions, Active Campaigns
- [ ] Campaigns list: 4 campaigns with status badges
- [ ] Social posts: 4 posts with platform icons, content, engagement metrics
- [ ] Quick Actions: 4 action buttons
- [ ] AI Suggestions: 3 suggestions with "Act on this" links
- [ ] Responsive layout: campaigns left (2/3), actions right (1/3)

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add frontend/
git commit -m "feat: marketing page with campaigns, social posts, AI suggestions"
```
