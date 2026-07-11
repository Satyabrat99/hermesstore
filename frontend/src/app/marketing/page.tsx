"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCampaigns, mockSocialPosts } from "@/lib/mock-data";
import {
  Megaphone,
  Camera,
  Hash,
  Briefcase,
  Mail,
  TrendingUp,
  Users,
  MousePointerClick,
  Plus,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Send,
  BarChart3,
} from "lucide-react";

const platformIcons = {
  instagram: Camera,
  twitter: Hash,
  linkedin: Briefcase,
  facebook: Mail,
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
                    <div className="p-2 rounded-lg bg-zinc-800">
                      {campaign.type === "social" ? (
                        <Camera className="w-4 h-4 text-pink-500" />
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
                { label: "Generate Instagram Post", icon: Camera, color: "text-pink-500" },
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
