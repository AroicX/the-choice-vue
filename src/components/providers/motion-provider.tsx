"use client";

import { MotionConfig } from "motion/react";

/** App-wide motion settings: animations switch off when the OS asks for reduced motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
