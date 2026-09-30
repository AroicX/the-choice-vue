"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PollCard } from "@/components/cards/poll-card";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { PollRowSkeleton } from "@/components/skeletons/card-skeletons";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePoll } from "@/lib/content-utils";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

type TabId = "open" | "closed" | "voted";

const ALL_TABS: Array<TimelineTab<TabId> & { requiresAuth?: boolean }> = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "voted", label: "Voted", requiresAuth: true }
];

const EMPTY: Record<TabId, { title: string; body: string; href?: string; action?: string }> = {
  open: { title: "No open polls", body: "New polls from discussion rooms will show up here.", href: "/discourse", action: "Browse rooms" },
  closed: { title: "No closed polls yet", body: "Final results appear here once polls close." },
  voted: { title: "You haven’t voted yet", body: "Polls you vote in will be collected here.", href: "/polls", action: "See open polls" }
};

export default function PollsPage() {
  return (
    <Suspense fallback={Array.from({ length: 3 }).map((_, index) => <PollRowSkeleton key={index} />)}>
      <PollsContent />
    </Suspense>
  );
}

function PollsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const tabs = ALL_TABS.filter((tab) => !tab.requiresAuth || isAuthenticated);
  const requested = searchParams.get("tab") as TabId | null;
  const active: TabId = tabs.some((tab) => tab.id === requested) ? (requested as TabId) : "open";

  // Scoped by viewer: the list carries per-user hasVoted.
  const query = useQuery({ queryKey: ["polls", userId ?? null], queryFn: civicQueries.polls });
  const polls = useMemo(() => asArray<ApiRecord>(query.data).map(normalizePoll), [query.data]);
  const visible = polls.filter((poll) =>
    active === "voted" ? poll.hasVoted : active === "closed" ? poll.closed : !poll.closed
  );

  function select(id: TabId) {
    router.replace(id === "open" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
  }

  return (
    <>
      <TimelineHeader title="Polls" tabs={tabs} active={active} onSelect={select} />
      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <PollRowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="polls" />
        ) : visible.length ? (
          visible.map((poll) => <PollCard key={poll.id} poll={poll} variant="timeline" />)
        ) : (
          <TimelineEmpty {...EMPTY[active]} />
        )}
      </div>
    </>
  );
}
