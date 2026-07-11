"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ApprovalDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  action: string;
  details?: { label: string; value: string }[];
  risk?: "low" | "medium" | "high";
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const riskColors = {
  low: "border-green-500/20 bg-green-500/5",
  medium: "border-yellow-500/20 bg-yellow-500/5",
  high: "border-red-500/20 bg-red-500/5",
};

export function ApprovalDialog({
  isOpen,
  title,
  description,
  action,
  details,
  risk = "medium",
  onApprove,
  onReject,
  isLoading,
}: ApprovalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`w-full max-w-md mx-4 p-0 ${riskColors[risk]} border`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
              </div>
            </div>
            <button onClick={onReject} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {details && details.length > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-3 mb-4 space-y-2">
              {details.map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{d.label}</span>
                  <span className="text-white font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReject}
              className="flex-1 border-zinc-700 text-zinc-300"
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : action}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
