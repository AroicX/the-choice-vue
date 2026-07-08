"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function CommunitiesPage() {
  const query = useQuery({
    queryKey: ["communities"],
    queryFn: () => getData<unknown>(endpoints.communities.list)
  });
  const communities = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Communities" description="Follow state, local, issue-based, and verified organization communities." />
      <div className="grid gap-4 md:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={communities.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No communities available yet."
        >
          {communities.map((community) => (
          <Link key={recordId(community)} href={`/communities/${recordId(community)}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-5">
              <h2 className="font-semibold">{displayName(community)}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{String(community.description ?? community.type ?? "Community")}</p>
              <p className="mt-4 text-xs font-medium text-primary">{String(community.state ?? community.lga ?? "Nigeria")}</p>
            </CardContent>
          </Card>
          </Link>
        ))}
        </QueryListState>
      </div>
    </div>
  );
}
