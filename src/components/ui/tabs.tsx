"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function TabList({
  tabs,
  active,
  queryKey = "tab"
}: {
  tabs: string[];
  active?: string;
  queryKey?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border bg-card/70 p-1.5 shadow-sm backdrop-blur">
      {tabs.map((tab) => (
        <Link
          key={tab}
          href={`?${queryKey}=${encodeURIComponent(tab)}`}
          className={cn(
            "rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all",
            (active ?? tabs[0]) === tab
              ? "bg-gradient-to-r from-primary/15 to-emerald-500/10 text-primary shadow-sm ring-1 ring-primary/15"
              : "hover:bg-accent/60 hover:text-accent-foreground"
          )}
        >
          {tab}
        </Link>
      ))}
    </div>
  );
}
