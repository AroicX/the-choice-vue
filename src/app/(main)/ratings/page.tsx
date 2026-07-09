"use client";

import { useQuery } from "@tanstack/react-query";
import { RatingCard } from "@/components/cards/rating-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { asArray, normalizeRatingCandidate } from "@/lib/content-utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { ApiRecord } from "@/types";

export default function RatingsPage() {
  const query = useQuery({
    queryKey: ["ratings", "candidates"],
    queryFn: () => getData<ApiRecord[]>(endpoints.ratings.list, { take: 48 })
  });
  const rows = asArray<ApiRecord>(query.data).map(normalizeRatingCandidate);

  return (
    <div>
      <PageHeader
        title="Ratings Hub"
        description="Review candidates, view photos, pick score levels, then submit your rating."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={rows.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No ratings data available yet."
        >
          {rows.map((candidate) => (
            <RatingCard key={candidate.id} candidate={candidate} />
          ))}
        </QueryListState>
      </div>
    </div>
  );
}
