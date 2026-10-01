"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimelineTab<T extends string = string> = { id: T; label: string };

/**
 * Sticky header for a timeline column: optional title row plus a tab bar with
 * an underline on the active tab. Tabs scroll horizontally when they overflow.
 * Sits under the 53px mobile top bar, at the very top from lg up.
 */
export function TimelineHeader<T extends string>({
  title,
  tabs,
  active,
  onSelect,
  className
}: {
  title?: string;
  className?: string;
  tabs: TimelineTab<T>[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className={cn("sticky top-[var(--app-bar,53px)] z-20 border-b bg-background/85 backdrop-blur-md lg:top-0", className)}>
      {title ? <h1 className="px-4 pb-1 pt-3 text-[17px] font-bold tracking-tight sm:text-xl">{title}</h1> : null}
      <div role="tablist" aria-label={title ? `${title} tabs` : "Feeds"} className="flex overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.id)}
              className="flex h-[53px] min-w-[88px] flex-1 shrink-0 justify-center px-4 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
            >
              <span
                className={cn(
                  "relative flex items-center whitespace-nowrap text-[15px]",
                  isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                )}
              >
                {tab.label}
                {isActive ? <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-primary" aria-hidden /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimelineEmpty({
  title,
  body,
  href,
  action
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mx-auto max-w-[400px] px-8 py-12">
      <p className="text-[22px] font-bold leading-7 sm:text-[28px] sm:leading-9 tracking-tight">{title}</p>
      <p className="mt-2 text-[15px] leading-5 text-muted-foreground">{body}</p>
      {href && action ? (
        <Button asChild size="lg" className="mt-7">
          <Link href={href}>{action}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function TimelineError({ onRetry, what = "posts" }: { onRetry: () => void; what?: string }) {
  return (
    <div className="px-8 py-12 text-center" role="alert">
      <p className="text-[17px] font-bold">Couldn’t load {what}</p>
      <p className="mt-1 text-[15px] text-muted-foreground">Check your connection and try again.</p>
      <Button className="mt-5" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
