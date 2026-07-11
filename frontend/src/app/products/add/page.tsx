"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  Image as ImageIcon,
  Type,
  Upload,
  Sparkles,
  X,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";

type InputMethod = "text" | "image" | "voice";

interface GeneratedProduct {
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string[];
}

export default function AddProductPage() {
  const [method, setMethod] = useState<InputMethod>("text");
  const [textInput, setTextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [product, setProduct] = useState<GeneratedProduct | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handleGenerate = async () => {
    if (!textInput.trim()) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProduct({
      title: textInput.split(" ").slice(0, 5).join(" "),
      description: `Premium quality ${textInput}. Handcrafted with care and attention to detail. Perfect for everyday use.`,
      price: "999",
      category: "General",
      tags: ["new", "featured"],
    });
    setIsGenerating(false);
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !product) return;
    if (!product.tags.includes(tagInput.trim())) {
      setProduct({ ...product, tags: [...product.tags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!product) return;
    setProduct({ ...product, tags: product.tags.filter((t) => t !== tag) });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);
    setPublished(true);
  };

  if (published) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="bg-obsidian border-charcoal rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-phosphor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-phosphor" />
          </div>
          <h2 className="text-xl font-medium text-snow mb-2">Product Created!</h2>
          <p className="text-silver mb-6">
            &quot;{product?.title}&quot; has been added to your store as a draft.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/products">
              <Button variant="outline" className="border-charcoal text-silver rounded-full">
                View Products
              </Button>
            </Link>
            <Button
              onClick={() => {
                setPublished(false);
                setProduct(null);
                setTextInput("");
              }}
              className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
            >
              Add Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
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
            Describe your product and let AI create the listing
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {[
          { id: "text" as InputMethod, label: "Text", icon: Type, desc: "Type a description" },
          { id: "image" as InputMethod, label: "Image", icon: ImageIcon, desc: "Upload a photo" },
          { id: "voice" as InputMethod, label: "Voice", icon: Mic, desc: "Speak your product" },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex-1 p-4 rounded-2xl border transition-colors ${
                isActive
                  ? "border-phosphor bg-phosphor/5"
                  : "border-charcoal bg-obsidian hover:border-graphite"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? "text-phosphor" : "text-smoke"}`} />
              <p className={`text-sm font-medium ${isActive ? "text-snow" : "text-silver"}`}>
                {m.label}
              </p>
              <p className="text-xs text-smoke mt-0.5">{m.desc}</p>
            </button>
          );
        })}
      </div>

      <Card className="bg-obsidian border-charcoal rounded-2xl p-6">
        {method === "text" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-silver mb-2 block">Describe your product</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Handmade leather wallet from Jaipur, brown, premium quality, ₹1,499"
                className="w-full h-32 bg-ash border border-slate text-snow rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-phosphor"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!textInput.trim() || isGenerating}
              className="bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Product Listing
                </>
              )}
            </Button>
          </div>
        )}

        {method === "image" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-charcoal rounded-2xl p-12 text-center hover:border-graphite transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-smoke mx-auto mb-3" />
              <p className="text-sm text-silver mb-1">Drop an image here or click to upload</p>
              <p className="text-xs text-smoke">PNG, JPG up to 10MB</p>
            </div>
            <p className="text-xs text-smoke text-center">
              AI will identify the product, generate title, description, tags, and suggest pricing
            </p>
          </div>
        )}

        {method === "voice" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-charcoal rounded-2xl p-12 text-center hover:border-graphite transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-phosphor/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-8 h-8 text-phosphor" />
              </div>
              <p className="text-sm text-silver mb-1">Click to start recording</p>
              <p className="text-xs text-smoke">
                Say something like: &quot;Add Nike Air Max, black, size 10, eight thousand nine hundred ninety nine rupees&quot;
              </p>
            </div>
            <p className="text-xs text-smoke text-center">
              Powered by Wispr Flow + ElevenLabs
            </p>
          </div>
        )}
      </Card>

      {product && (
        <Card className="bg-obsidian border-charcoal rounded-2xl p-6">
          <h2 className="text-lg font-medium text-snow mb-4">Generated Listing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-ash rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-graphite mx-auto mb-2" />
                <p className="text-sm text-smoke">AI-generated image will appear here</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-smoke mb-1 block">Title</label>
                <Input
                  value={product.title}
                  onChange={(e) => setProduct({ ...product, title: e.target.value })}
                  className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                />
              </div>

              <div>
                <label className="text-xs text-smoke mb-1 block">Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  className="w-full h-24 bg-ash border border-slate text-snow rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-phosphor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-smoke mb-1 block">Price (₹)</label>
                  <Input
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                  />
                </div>
                <div>
                  <label className="text-xs text-smoke mb-1 block">Category</label>
                  <Input
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-smoke mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-charcoal text-silver rounded-full pr-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Add a tag..."
                    className="bg-ash border-slate text-snow rounded-full focus:border-phosphor"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="border-charcoal text-silver rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-charcoal text-silver rounded-full"
                  onClick={() => setProduct(null)}
                >
                  Discard
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 bg-phosphor hover:bg-mint text-obsidian rounded-full font-medium"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish to Store"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
