"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Soft spring shared by result animations: quick, no wobble. */
export const RESULT_SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;

/**
 * A results bar that grows from 0 to `percent` the first time it's on
 * screen. `index` staggers rows so a list fills top to bottom.
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">.
 */
export function ResultBar({ percent, index = 0, className }: { percent: number; index?: number; className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("absolute inset-y-0 left-0", className)}
      initial={{ width: "0%" }}
      animate={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      transition={{ ...RESULT_SPRING, delay: index * 0.06 }}
    />
  );
}

/** A whole number that counts up to `value` when it first appears. */
export function AnimatedNumber({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [count, delay, inView, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
