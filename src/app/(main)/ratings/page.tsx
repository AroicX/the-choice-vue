"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function RatingsPage() {
  const query = useQuery({
    queryKey: ["ratings", "leaderboard"],
    queryFn: civicQueries.ratings
  });
  const rows = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Ratings Hub" description="Compare approval, performance, transparency, and public accountability." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={rows.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No ratings data available yet."
        >
          {rows.map((row) => {
          const politician = (row.politician ?? row.candidate ?? row) as ApiRecord;
          const href = politician.id || row.politicianId ? `/politicians/${String(politician.id ?? row.politicianId)}` : "/politicians";
          return (
          <Link key={recordId(row)} href={href}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-5">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-semibold">{displayName(politician)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{String(row.category ?? politician.position ?? "Leaderboard score")}</p>
              <p className="mt-4 text-2xl font-bold">{Number(row.score ?? row.performanceScore ?? row.approvalScore ?? 0)}%</p>
              <p className="text-sm text-muted-foreground">Public score</p>
            </CardContent>
          </Card>
          </Link>
        );})}
        </QueryListState>
      </div>
    </div>
  );
}
