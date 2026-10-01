import { cn } from "@/lib/utils";
import type { Issue } from "@/types";

const STATUS: Record<Issue["status"], { label: string; dot: string }> = {
  OPEN: { label: "Open", dot: "bg-amber-400" },
  UNDER_REVIEW: { label: "Under review", dot: "bg-sky-400" },
  IN_PROGRESS: { label: "In progress", dot: "bg-violet-400" },
  RESOLVED: { label: "Resolved", dot: "bg-primary" },
  REJECTED: { label: "Rejected", dot: "bg-destructive" },
  ARCHIVED: { label: "Archived", dot: "bg-muted-foreground" }
};

export function issueStatusLabel(status: Issue["status"]) {
  return (STATUS[status] ?? STATUS.OPEN).label;
}

/** Small status pill with a coloured dot. */
export function IssueStatusPill({ status, className }: { status: Issue["status"]; className?: string }) {
  const style = STATUS[status] ?? STATUS.OPEN;
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full bg-secondary px-2.5 text-[12px] font-semibold", className)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </span>
  );
}
