"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PollCard } from "@/components/cards/poll-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { PollCardSkeleton } from "@/components/skeletons/card-skeletons";
import { TabList } from "@/components/ui/tabs";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePoll } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

const tabs = ["Active", "Trending", "Local", "My Votes", "Closed"];

export default function PollsPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <PollCardSkeleton key={index} />)}</div>}>
      <PollsContent />
    </Suspense>
  );
}

function PollsContent() {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? tabs[0];
  const query = useQuery({
    queryKey: ["polls"],
    queryFn: civicQueries.polls
  });
  const rawPolls = asArray<ApiRecord>(query.data).filter((poll) => {
    const status = String(poll.status ?? "").toUpperCase();
    if (active === "Closed") return ["CLOSED", "ENDED", "COMPLETED"].includes(status);
    if (active === "Active") return !["CLOSED", "ENDED", "COMPLETED"].includes(status);
    if (active === "Local") return String(poll.scope ?? poll.type ?? "").toUpperCase() === "LOCAL";
    if (active === "My Votes") return Boolean(poll.myVote ?? poll.voted);
    return true;
  });
  const polls = rawPolls.map(normalizePoll);

  return (
    <div>
      <PageHeader title="Polls" description="Vote on active civic questions and explore community sentiment." />
      <TabList tabs={tabs} active={active} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={polls.length === 0}
          count={4}
          skeleton={<PollCardSkeleton />}
          emptyMessage="No polls found for this tab."
        >
          {polls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
        </QueryListState>
      </div>
    </div>
  );
}
