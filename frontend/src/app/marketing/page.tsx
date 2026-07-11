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
  active: "bg-phosphor/10 text-phosphor border-phosphor/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-smoke/10 text-smoke border-smoke/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  published: "bg-phosphor/10 text-phosphor border-phosphor/20",
};

export default function MarketingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-snow">Marketing</h1>
          <p className="text-sm text-silver mt-1">
            Manage campaigns, social media, and email marketing
          </p>
        </div>
        <Button className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reach", value: "60,700", icon: Users, change: "+18%" },
          { label: "Engagement", value: "3,630", icon: MousePointerClick, change: "+12%" },
          { label: "Conversions", value: "159", icon: TrendingUp, change: "+24%" },
          { label: "Active Campaigns", value: "2", icon: Megaphone, change: "" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-obsidian border-charcoal rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-silver text-sm">{stat.label}</span>
                <Icon className="w-4 h-4 text-smoke" />
              </div>
              <div className="text-xl font-medium text-snow">{stat.value}</div>
              {stat.change && (
                <span className="text-xs text-phosphor">{stat.change} this month</span>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="p-4 border-b border-charcoal flex items-center justify-between">
              <h2 className="text-lg font-medium text-snow">Campaigns</h2>
              <Button variant="outline" size="sm" className="border-charcoal text-silver rounded-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="divide-y divide-charcoal">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ash">
                      {campaign.type === "social" ? (
                        <Camera className="w-4 h-4 text-pink-500" />
                      ) : campaign.type === "email" ? (
                        <Mail className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Megaphone className="w-4 h-4 text-phosphor" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-snow">{campaign.name}</p>
                      <p className="text-xs text-smoke">
                        {campaign.platform} · {campaign.type} · {campaign.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-snow">{campaign.reach.toLocaleString()} reach</p>
                      <p className="text-xs text-smoke">{campaign.conversions} conversions</p>
                    </div>
                    <Badge variant="outline" className={`rounded-full ${statusColors[campaign.status]}`}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="p-4 border-b border-charcoal flex items-center justify-between">
              <h2 className="text-lg font-medium text-snow">Social Media Posts</h2>
              <Button variant="outline" size="sm" className="border-charcoal text-silver rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Generate Post
              </Button>
            </div>
            <div className="divide-y divide-charcoal">
              {mockSocialPosts.map((post) => {
                const Icon = platformIcons[post.platform];
                const color = platformColors[post.platform];
                return (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-snow capitalize">
                            {post.platform}
                          </span>
                          <Badge variant="outline" className={`rounded-full ${statusColors[post.status]}`}>
                            {post.status}
                          </Badge>
                          {post.scheduledFor && (
                            <span className="text-xs text-smoke flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.scheduledFor}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-silver mb-2">{post.content}</p>
                        {post.image && (
                          <div className="w-20 h-20 rounded-xl bg-ash overflow-hidden mb-2">
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {post.status === "published" && (
                          <div className="flex gap-4 text-xs text-smoke">
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

        <div className="space-y-6">
          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="p-4 border-b border-charcoal">
              <h2 className="text-lg font-medium text-snow">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Generate Instagram Post", icon: Camera, color: "text-pink-500" },
                { label: "Create Email Campaign", icon: Mail, color: "text-blue-400" },
                { label: "Launch Ad Campaign", icon: Megaphone, color: "text-phosphor" },
                { label: "Send Promo Message", icon: Send, color: "text-purple-400" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start border-charcoal bg-ash/50 hover:bg-ash text-snow rounded-full"
                  >
                    <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </Card>

          <Card className="bg-obsidian border-charcoal rounded-2xl">
            <div className="p-4 border-b border-charcoal">
              <h2 className="text-lg font-medium text-snow">AI Suggestions</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                "Post about your bestseller on Instagram — it's trending in your category",
                "Send a flash sale email to your 3,200 subscribers",
                "Your competitor dropped prices — consider a counter-campaign",
              ].map((suggestion, i) => (
                <div key={i} className="p-3 bg-ash/50 rounded-2xl">
                  <p className="text-xs text-silver">{suggestion}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-xs text-phosphor hover:text-mint p-0"
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
