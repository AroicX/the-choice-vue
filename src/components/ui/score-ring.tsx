"use client";

import { motion } from "motion/react";
import { RESULT_SPRING } from "@/components/motion/result-bar";
import { cn } from "@/lib/utils";

/** Circular approval meter; a dashed empty ring when nobody has rated yet. */
export function ScoreRing({ score }: { score: number | null }) {
  const size = 52;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score === null ? 0 : Math.max(0, Math.min(100, score));

  return (
    <span
      className="relative grid size-[52px] shrink-0 place-items-center"
      role="img"
      aria-label={score === null ? "No public score yet" : `Public approval ${Math.round(value)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
          strokeDasharray={score === null ? "3 4" : undefined}
        />
        {score !== null ? (
          // Draws in from empty the first time it renders.
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
            transition={RESULT_SPRING}
          />
        ) : null}
      </svg>
      <span className={cn("text-[13px] font-bold tabular-nums", score === null && "text-muted-foreground")}>
        {score === null ? "—" : `${Math.round(value)}%`}
      </span>
    </span>
  );
}
