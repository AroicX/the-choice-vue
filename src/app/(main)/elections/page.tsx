"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Vote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function ElectionsPage() {
  const query = useQuery({
    queryKey: ["elections"],
    queryFn: civicQueries.elections
  });
  const elections = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Mock Elections" description="Follow upcoming, live, and completed civic simulations." />
      <div className="grid gap-4 md:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={elections.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No elections available yet."
        >
          {elections.map((election) => {
          const status = String(election.status ?? "Live");
          const options = election.options && typeof election.options === "object" ? Object.keys(election.options).length : 0;
          return (
          <Card key={recordId(election)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Vote className="h-6 w-6 text-primary" />
                <Badge variant={status.toUpperCase().includes("LIVE") || status.toUpperCase().includes("ONGOING") ? "default" : "secondary"}>{status}</Badge>
              </div>
              <h2 className="mt-5 font-semibold">{displayName(election)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{options} options · {Number(election.electionCount ?? election.voteCount ?? 0).toLocaleString()} votes</p>
              <Button className="mt-5 w-full" variant="outline" asChild>
                <Link href={`/elections/${recordId(election)}`}>{options ? "Vote / view results" : "View"}</Link>
              </Button>
            </CardContent>
          </Card>
        );})}
        </QueryListState>
      </div>
    </div>
  );
}
