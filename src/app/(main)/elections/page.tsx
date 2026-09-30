"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ElectionCard } from "@/components/cards/election-card";
import { PageHeader } from "@/components/shared/page-header";
import { TimelineEmpty, TimelineError } from "@/components/timeline/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { UnderlineTabs } from "@/components/ui/filters";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, electionPhase, normalizeElection, type ElectionPhase } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

type Tab = "all" | ElectionPhase;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "closed", label: "Completed" }
];

// Live first, then upcoming, then finished; newest first within each.
const PHASE_ORDER: Record<ElectionPhase, number> = { live: 0, upcoming: 1, closed: 2 };

function ElectionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border" aria-hidden>
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="flex justify-between border-t pt-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function ElectionsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const query = useQuery({ queryKey: ["elections"], queryFn: civicQueries.elections });

  const elections = useMemo(
    () =>
      asArray<ApiRecord>(query.data)
        .map(normalizeElection)
        .sort(
          (a, b) =>
            PHASE_ORDER[electionPhase(a.status)] - PHASE_ORDER[electionPhase(b.status)] ||
            String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
        ),
    [query.data]
  );

  const counts = useMemo(() => {
    const result: Record<Tab, number> = { all: elections.length, live: 0, upcoming: 0, closed: 0 };
    for (const election of elections) result[electionPhase(election.status)] += 1;
    return result;
  }, [elections]);

  const visible = tab === "all" ? elections : elections.filter((election) => electionPhase(election.status) === tab);

  return (
    <div>
      <PageHeader title="Elections" description="Mock elections: see where citizens stand before the real vote." />

      <UnderlineTabs
        label="Election status"
        // Empty statuses would be dead-end tabs; keep "All" and the active one.
        tabs={TABS.filter((item) => item.id === "all" || item.id === tab || counts[item.id]).map((item) => ({
          ...item,
          count: counts[item.id]
        }))}
        active={tab}
        onSelect={setTab}
      />

      <div className="mt-6">
        {query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <ElectionCardSkeleton key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="elections" />
        ) : visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        ) : (
          <TimelineEmpty title="No elections yet" body="Mock elections will appear here when they’re scheduled." />
        )}
      </div>
    </div>
  );
}
