import type { ElectionPhase } from "@/lib/content-utils";
import { cn } from "@/lib/utils";

const LABEL: Record<ElectionPhase, string> = { live: "Live", upcoming: "Upcoming", closed: "Results" };

/** Status pill for election covers. "Live" gets a pulsing dot. */
export function ElectionStatusPill({ phase, className }: { phase: ElectionPhase; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold backdrop-blur-md",
        phase === "live" ? "bg-black/60 text-white" : "bg-white/85 text-[#0F1419]",
        className
      )}
    >
      {phase === "live" ? (
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-[#4ADE80] opacity-75 motion-safe:animate-ping" />
          <span className="relative size-2 rounded-full bg-[#4ADE80]" />
        </span>
      ) : null}
      {LABEL[phase]}
    </span>
  );
}
