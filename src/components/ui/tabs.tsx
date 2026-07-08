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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab}
          href={`?${queryKey}=${encodeURIComponent(tab)}`}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground",
            (active ?? tabs[0]) === tab && "border-primary bg-accent text-accent-foreground"
          )}
        >
          {tab}
        </Link>
      ))}
    </div>
  );
}
