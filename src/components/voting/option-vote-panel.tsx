"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VoteOption } from "@/types";

type OptionVotePanelProps = {
  options: VoteOption[];
  votesLabel?: string;
  totalVotes?: number;
  disabled?: boolean;
  isSubmitting?: boolean;
  hasVoted?: boolean;
  initialSelectedKey?: string | null;
  onVote: (optionKey: string) => void;
  emptyMessage?: string;
};

export function OptionVotePanel({
  options,
  votesLabel = "votes",
  totalVotes,
  disabled = false,
  isSubmitting = false,
  hasVoted = false,
  initialSelectedKey = null,
  onVote,
  emptyMessage = "No options available."
}: OptionVotePanelProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialSelectedKey);
  const canVote = !disabled && !hasVoted && !isSubmitting;

  if (!options.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {options.map((option) => {
          const selected = selectedKey === option.key;
          const image = option.image?.trim();

          return (
            <button
              key={option.key}
              type="button"
              disabled={!canVote}
              onClick={() => {
                if (!canVote) return;
                setSelectedKey((current) => (current === option.key ? null : option.key));
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                canVote ? "hover:border-primary/40 hover:bg-accent/30" : "cursor-default",
                selected && "border-primary bg-primary/5 ring-1 ring-primary/25"
              )}
            >
              {image ? (
                <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-muted">
                  <Image src={image} alt={option.label} fill className="object-cover" sizes="(max-width:768px) 100vw, 420px" />
                </div>
              ) : null}

              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{option.label}</span>
                <span className="shrink-0 font-semibold text-primary">
                  {hasVoted || !canVote ? `${option.value}%` : selected ? "Selected" : `${option.value}%`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, option.value))}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {typeof totalVotes === "number" ? `${Math.round(totalVotes).toLocaleString()} ${votesLabel}` : null}
          {hasVoted ? " · Your vote is in" : null}
        </p>
        {!hasVoted ? (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            disabled={!selectedKey || !canVote}
            onClick={() => {
              if (!selectedKey) return;
              onVote(selectedKey);
            }}
          >
            {isSubmitting ? "Submitting..." : "Vote"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
