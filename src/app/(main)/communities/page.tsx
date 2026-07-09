"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { asArray, normalizeCommunity } from "@/lib/content-utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { ApiRecord } from "@/types";

export default function CommunitiesPage() {
  const query = useQuery({
    queryKey: ["communities"],
    queryFn: () => getData<unknown>(endpoints.communities.list)
  });
  const communities = asArray<ApiRecord>(query.data).map(normalizeCommunity);

  return (
    <div>
      <PageHeader title="Communities" description="Follow state, local, issue-based, and verified organization communities." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={communities.length === 0}
          count={6}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No communities available yet."
        >
          {communities.map((community) => (
            <Link key={community.id} href={`/communities/${community.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardContent className="p-5">
                  <Badge variant="secondary">{community.type}</Badge>
                  <h2 className="mt-4 font-semibold">{community.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{community.description}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {[community.lga, community.state].filter(Boolean).join(", ") || "Nigeria"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </QueryListState>
      </div>
    </div>
  );
}
