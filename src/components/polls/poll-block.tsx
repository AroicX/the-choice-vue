"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { endsIn } from "@/lib/content-utils";
import { CheckmarkCircle02Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { votePollMutation } from "@/services/mutations/civic.mutations";
import type { Poll } from "@/types";

/**
 * X-style poll: one tap on an option casts the vote, results show straight
 * away (optimistically, then confirmed by the server). Closed polls and
 * polls you've voted in show results; the leader is bold, your pick ticked.
 */
export function PollBlock({ poll, size = "default" }: { poll: Poll; size?: "default" | "large" }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [picked, setPicked] = useState<string | null>(null);

  const yourOption = poll.userOption ?? picked;
  const voted = Boolean(poll.hasVoted || picked);
  const showResults = voted || poll.closed;

  // Fold the optimistic vote into the counts until the server confirms.
  const { options, total } = useMemo(() => {
    const addLocal = picked && !poll.hasVoted;
    const counts = poll.options.map((option) => ({
      ...option,
      count: (option.rawValue ?? 0) + (addLocal && option.key === picked ? 1 : 0)
    }));
    const sum = counts.reduce((acc, option) => acc + option.count, 0);
    return {
      options: counts.map((option) => ({ ...option, percent: sum ? Math.round((option.count / sum) * 100) : 0 })),
      total: sum
    };
  }, [picked, poll.hasVoted, poll.options]);
  const leaderCount = Math.max(0, ...options.map((option) => option.count));

  const vote = useMutation({
    mutationFn: (value: string) => votePollMutation({ pollId: poll.id, value }),
    onSuccess: () => {
      for (const key of [["polls"], ["discussion-polls"], ["discourse", "polls"], ["shell", "polls"], ["poll", poll.id]]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) return; // Keep showing results.
      setPicked(null);
      gooeyToast.error("Your vote didn’t go through", { description: message });
    }
  });

  const large = size === "large";
  const until = endsIn(poll.expiresAt);
  const meta = [
    `${total.toLocaleString()} ${total === 1 ? "vote" : "votes"}`,
    poll.closed ? "Final results" : until ?? "Open"
  ].join(" · ");

  return (
    <div onClick={(event) => event.stopPropagation()}>
      {showResults ? (
        <ul className="space-y-1.5">
          {options.map((option) => {
            const leading = total > 0 && option.count === leaderCount;
            const mine = option.key === yourOption;
            return (
              <li key={option.key} className={cn("relative overflow-hidden rounded-md", large ? "h-11" : "h-9")}>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-md transition-[width] duration-500 motion-reduce:transition-none",
                    leading ? "bg-primary/25" : "bg-foreground/[0.08]"
                  )}
                  style={{ width: `${Math.max(option.percent, 1)}%` }}
                />
                <span className={cn("relative flex h-full items-center justify-between gap-3 px-3", large ? "text-[16px]" : "text-[15px]")}>
                  <span className={cn("flex min-w-0 items-center gap-1.5", leading && "font-bold")}>
                    <span className="truncate">{option.label}</span>
                    {mine ? <AppIcon icon={CheckmarkCircle02Icon} size={16} className="shrink-0 text-primary" /> : null}
                  </span>
                  <span className={cn("shrink-0 tabular-nums", leading && "font-bold")}>{option.percent}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-1.5">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={vote.isPending}
              onClick={() => {
                if (!requireAuth("Sign in to vote in this poll.")) return;
                setPicked(option.key);
                vote.mutate(option.key);
              }}
              className={cn(
                "flex w-full items-center justify-center rounded-md border border-input px-3 font-medium transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
                large ? "h-11 text-[16px]" : "h-9 text-[15px]"
              )}
            >
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-[13px] text-muted-foreground">
        {meta}
        {!showResults ? " · Tap to vote, votes are final" : ""}
      </p>
    </div>
  );
}
