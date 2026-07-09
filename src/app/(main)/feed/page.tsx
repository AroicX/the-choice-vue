"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PostCard } from "@/components/cards/post-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton, PostCardSkeleton } from "@/components/skeletons/card-skeletons";
import { TabList } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, normalizePost, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const tabs = ["For You", "Following", "Local", "Trending", "Fact Checks"];
const feedEndpointByTab: Record<string, () => Promise<unknown>> = {
  "For You": () => civicQueries.feed("home"),
  Following: () => civicQueries.feed("following"),
  Local: () => civicQueries.feed("local"),
  Trending: () => civicQueries.feed("trending"),
  "Fact Checks": civicQueries.factChecks
};

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)}</div>}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const active = searchParams.get("tab") ?? tabs[0];
  const query = useQuery({
    queryKey: ["feed", active],
    queryFn: feedEndpointByTab[active] ?? feedEndpointByTab["For You"]
  });
  const records = asArray<ApiRecord>(query.data);
  const posts = active === "Fact Checks" ? [] : records.map((record) => normalizePost(record, userId));

  return (
    <div>
      <PageHeader title="Civic Feed" description="Posts, civic updates, public performance notes, and community signals." />
      <TabList tabs={tabs} active={active} />
      <div className="mt-5 space-y-4">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={records.length === 0}
          count={3}
          skeleton={active === "Fact Checks" ? <GenericCardSkeleton /> : <PostCardSkeleton />}
          emptyMessage="No records found for this tab."
        >
          {active === "Fact Checks"
            ? records.map((record) => (
                <Link key={recordId(record)} href={`/fact-checks/${recordId(record)}`}>
                  <Card className="transition-colors hover:bg-accent">
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-primary">{String(record.verdict ?? "Fact check")}</p>
                      <h2 className="mt-2 text-lg font-semibold">{displayName(record)}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{String(record.explanation ?? record.description ?? "")}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </QueryListState>
      </div>
    </div>
  );
}
