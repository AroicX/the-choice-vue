"use client";

import { useQuery } from "@tanstack/react-query";
import { ElectionCard } from "@/components/cards/election-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizeElection } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function ElectionsPage() {
  const query = useQuery({
    queryKey: ["elections"],
    queryFn: civicQueries.elections
  });
  const elections = asArray<ApiRecord>(query.data).map(normalizeElection);

  return (
    <div>
      <PageHeader title="Mock Elections" description="Select a candidate, then cast your vote. Images show when available." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={elections.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No elections available yet."
        >
          {elections.map((election) => (
            <ElectionCard key={election.id} election={election} compact />
          ))}
        </QueryListState>
      </div>
    </div>
  );
}
