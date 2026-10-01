"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IssueCard } from "@/components/cards/issue-card";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { asArray, normalizeIssue } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { issuesService } from "@/services/civic-content.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

type TabId = "top" | "new" | "resolved" | "mine";
type Scope = "" | "LOCAL" | "STATE" | "NATIONAL";

const ALL_TABS: Array<TimelineTab<TabId> & { requiresAuth?: boolean }> = [
  { id: "top", label: "Top" },
  { id: "new", label: "New" },
  { id: "resolved", label: "Resolved" },
  { id: "mine", label: "Mine", requiresAuth: true }
];

const SCOPES: Array<{ id: Scope; label: string }> = [
  { id: "", label: "All" },
  { id: "LOCAL", label: "Local" },
  { id: "STATE", label: "State" },
  { id: "NATIONAL", label: "National" }
];

export default function IssuesPage() {
  return (
    <Suspense fallback={Array.from({ length: 4 }).map((_, index) => <PostRowSkeleton key={index} />)}>
      <IssuesContent />
    </Suspense>
  );
}

function IssuesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [scope, setScope] = useState<Scope>("");

  const tabs = ALL_TABS.filter((tab) => !tab.requiresAuth || isAuthenticated);
  const requested = searchParams.get("tab") as TabId | null;
  const active: TabId = tabs.some((tab) => tab.id === requested) ? (requested as TabId) : "top";

  // Filtering and sorting happen on the server, so nothing past page 1 is lost.
  const params = {
    take: 100,
    sort: active === "top" ? "top" : "new",
    status: active === "resolved" ? "RESOLVED" : undefined,
    mine: active === "mine" ? "true" : undefined,
    type: scope || undefined
  };
  const query = useQuery({
    queryKey: ["issues", userId ?? null, params],
    queryFn: () => issuesService.list<ApiRecord>(params)
  });
  const issues = asArray<ApiRecord>(query.data).map(normalizeIssue);

  function select(id: TabId) {
    router.replace(id === "top" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
  }

  return (
    <>
      <TimelineHeader title="Issues" tabs={tabs} active={active} onSelect={select} />

      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-[15px] font-medium">Seen a problem in your ward?</p>
        <Button asChild size="sm">
          <Link href="/issues/create">Report an issue</Link>
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b px-4 py-2.5 [scrollbar-width:none]" role="group" aria-label="Scope">
        {SCOPES.map((item) => (
          <button
            key={item.id || "all"}
            type="button"
            aria-pressed={scope === item.id}
            onClick={() => setScope(item.id)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              scope === item.id ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <PostRowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="issues" />
        ) : issues.length ? (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        ) : active === "mine" ? (
          <TimelineEmpty title="You haven’t reported anything" body="Issues you report will be tracked here." href="/issues/create" action="Report an issue" />
        ) : active === "resolved" ? (
          <TimelineEmpty title="Nothing resolved yet" body="Issues marked resolved will appear here." />
        ) : (
          <TimelineEmpty title="No issues here yet" body="Be the first to report a problem in your area." href="/issues/create" action="Report an issue" />
        )}
      </div>
    </>
  );
}
