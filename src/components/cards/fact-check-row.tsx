import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { formatRelativeTime } from "@/lib/content-utils";
import { SecurityCheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { FactCheck } from "@/types";

const VERDICT_STYLE: Record<string, { label: string; className: string }> = {
  TRUE: { label: "True", className: "bg-primary/10 text-primary" },
  MOSTLY_TRUE: { label: "Mostly true", className: "bg-primary/10 text-primary" },
  MIXED: { label: "Mixed", className: "bg-secondary text-foreground" },
  UNVERIFIED: { label: "Unverified", className: "bg-secondary text-muted-foreground" },
  MISLEADING: { label: "Misleading", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  MOSTLY_FALSE: { label: "Mostly false", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  FALSE: { label: "False", className: "bg-destructive/10 text-destructive" }
};

export function verdictLabel(verdict: string) {
  return (VERDICT_STYLE[verdict.toUpperCase()] ?? VERDICT_STYLE.UNVERIFIED).label;
}

export function VerdictPill({ verdict }: { verdict: string }) {
  const style = VERDICT_STYLE[verdict.toUpperCase()] ?? VERDICT_STYLE.UNVERIFIED;
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold", style.className)}>
      {style.label}
    </span>
  );
}

/** Timeline row for a fact check: the claim is the headline, the verdict the payoff. */
export function FactCheckRow({ factCheck }: { factCheck: FactCheck }) {
  const time = formatRelativeTime(factCheck.createdAt);
  return (
    <Link
      href={`/fact-checks/${factCheck.id}`}
      className="flex gap-3 border-b px-4 py-3 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground" aria-hidden>
        <AppIcon icon={SecurityCheckIcon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[15px] leading-5 text-muted-foreground">
          <span className="font-bold text-foreground">Fact check</span>
          {time ? (
            <>
              <span aria-hidden>·</span>
              <time dateTime={factCheck.createdAt}>{time}</time>
            </>
          ) : null}
        </span>
        <span className="mt-0.5 block text-[15px] leading-5">“{factCheck.claim}”</span>
        {factCheck.explanation ? (
          <span className="mt-1 line-clamp-2 block text-[15px] leading-5 text-muted-foreground">{factCheck.explanation}</span>
        ) : null}
        <span className="mt-2.5 flex items-center gap-2">
          <VerdictPill verdict={factCheck.verdict} />
          {factCheck.sources.length ? (
            <span className="text-[13px] text-muted-foreground">
              {factCheck.sources.length} source{factCheck.sources.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
