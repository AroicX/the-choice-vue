"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber, ResultBar } from "@/components/motion/result-bar";
import { Button } from "@/components/ui/button";
import type { ElectionPhase } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import type { VoteOption } from "@/types";

type BallotProps = {
  phase: ElectionPhase;
  options: VoteOption[];
  totalVotes: number;
  hasVoted: boolean;
  /** Option the viewer voted for, if known. */
  votedKey?: string | null;
  isSubmitting: boolean;
  /** Runs before a candidate is picked; return false to block (sign-in). */
  onBeforeSelect: () => boolean;
  onVote: (optionKey: string) => void;
};

function Portrait({ option }: { option: VoteOption }) {
  return (
    <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-secondary">
      {option.image ? (
        <Image src={option.image} alt="" fill className="object-cover object-top" sizes="48px" />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-base font-bold text-muted-foreground" aria-hidden>
          {option.label.charAt(0)}
        </span>
      )}
    </span>
  );
}

/**
 * Election ballot with three faces:
 *  - live, not voted: pick a candidate (radio rows), confirm in a sticky bar
 *  - voted or closed: results, largest first, with the leader and your vote marked
 *  - upcoming: the candidates only; seeded counts are not real votes
 */
export function Ballot({ phase, options, totalVotes, hasVoted, votedKey, isSubmitting, onBeforeSelect, onVote }: BallotProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const yourVote = votedKey ?? justVoted;
  const showResults = phase === "closed" || hasVoted;

  if (phase === "upcoming") {
    return (
      <div>
        <p className="mb-3 text-[15px] text-muted-foreground">Voting opens when this election goes live.</p>
        <ul className="divide-y rounded-xl border">
          {options.map((option) => (
            <li key={option.key} className="flex items-center gap-3 px-4 py-3">
              <Portrait option={option} />
              <span className="text-[16px] font-semibold">{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (showResults) {
    const ranked = [...options].sort((a, b) => b.value - a.value);
    const leader = totalVotes > 0 ? ranked[0]?.key : undefined;
    return (
      <div>
        <ul className="space-y-2">
          {ranked.map((option, index) => {
            const isLeader = option.key === leader;
            const isYours = option.key === yourVote;
            return (
              <li key={option.key} className="relative overflow-hidden rounded-xl border px-4 py-3">
                {/* The bar is the row background, so the result reads at a glance. */}
                <ResultBar percent={option.value} index={index} className={isLeader ? "bg-primary/15" : "bg-foreground/[0.05]"} />
                <span className="relative flex items-center gap-3">
                  <Portrait option={option} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{option.label}</span>
                    <span className="flex gap-2 text-[13px] text-muted-foreground">
                      {isLeader ? <span className="font-semibold text-primary">{phase === "closed" ? "Winner" : "Leading"}</span> : null}
                      {isYours ? <span>Your vote</span> : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[17px] font-bold tabular-nums">
                      <AnimatedNumber value={option.value} suffix="%" delay={index * 0.06} />
                    </span>
                    <span className="block text-[12px] text-muted-foreground tabular-nums">
                      {(option.rawValue ?? 0).toLocaleString()} votes
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[13px] text-muted-foreground">
          {Math.round(totalVotes).toLocaleString()} {Math.round(totalVotes) === 1 ? "vote" : "votes"} cast
          {phase === "live" ? " · results update as people vote" : ""}
        </p>
      </div>
    );
  }

  const choice = options.find((option) => option.key === selected);

  return (
    <div>
      <div role="radiogroup" aria-label="Candidates" className="space-y-2">
        {options.map((option) => {
          const active = option.key === selected;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                if (!onBeforeSelect()) return;
                setSelected(active ? null : option.key);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-foreground bg-foreground/[0.04]" : "border-input hover:bg-foreground/[0.03]"
              )}
            >
              <Portrait option={option} />
              <span className="flex-1 text-[16px] font-semibold">{option.label}</span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  active ? "border-primary" : "border-input"
                )}
                aria-hidden
              >
                {active ? <span className="size-2.5 rounded-full bg-primary" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sticky confirm bar: names the choice so nobody votes by accident.
          Slides up once a candidate is picked. */}
      <AnimatePresence>
        {choice ? (
      <motion.div
        key="confirm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="sticky bottom-[60px] mt-4 flex items-center justify-between gap-3 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur-md lg:bottom-4"
      >
        <p className="min-w-0 truncate text-[14px] text-muted-foreground">
          {choice ? "One vote per person. It can’t be changed." : "Pick a candidate to vote."}
        </p>
        <Button
          className="shrink-0"
          disabled={!choice || isSubmitting}
          onClick={() => {
            if (!choice) return;
            setJustVoted(choice.key);
            onVote(choice.key);
          }}
        >
          {isSubmitting ? "Voting…" : choice ? `Vote for ${choice.label}` : "Vote"}
        </Button>
      </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
