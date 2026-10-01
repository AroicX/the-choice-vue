"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber, ResultBar } from "@/components/motion/result-bar";
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
      {/* Choices cross-fade into results; bars then grow in, top to bottom. */}
      <AnimatePresence mode="wait" initial={false}>
        {showResults ? (
          <motion.ul
            key="results"
            className="space-y-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            {options.map((option, index) => {
              const leading = total > 0 && option.count === leaderCount;
              const mine = option.key === yourOption;
              return (
                <li key={option.key} className={cn("relative overflow-hidden rounded-full", large ? "h-11" : "h-9")}>
                  <ResultBar
                    percent={Math.max(option.percent, 1)}
                    index={index}
                    className={cn("rounded-full", leading ? "bg-primary/25" : "bg-foreground/[0.08]")}
                  />
                  <span className={cn("relative flex h-full items-center justify-between gap-3 px-4", large ? "text-[16px]" : "text-[15px]")}>
                    <span className={cn("flex min-w-0 items-center gap-1.5", leading && "font-bold")}>
                      <span className="truncate">{option.label}</span>
                      {mine ? (
                        <motion.span
                          className="flex shrink-0"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.25 }}
                        >
                          <AppIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary" />
                        </motion.span>
                      ) : null}
                    </span>
                    <span className={cn("shrink-0 tabular-nums", leading && "font-bold")}>
                      <AnimatedNumber value={option.percent} suffix="%" delay={index * 0.06} />
                    </span>
                  </span>
                </li>
              );
            })}
          </motion.ul>
        ) : (
          <motion.div
            key="choices"
            className="space-y-1.5"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((option) => (
              <motion.button
                key={option.key}
                type="button"
                disabled={vote.isPending}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!requireAuth("Sign in to vote in this poll.")) return;
                  setPicked(option.key);
                  vote.mutate(option.key);
                }}
                className={cn(
                  "flex w-full items-center justify-center rounded-full border border-input px-4 font-medium transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
                  large ? "h-11 text-[16px]" : "h-9 text-[15px]"
                )}
              >
                <span className="truncate">{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {meta}
        {!showResults ? " · Tap to vote, votes are final" : ""}
      </p>
    </div>
  );
}
