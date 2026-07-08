"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function NewsPage() {
  const query = useQuery({
    queryKey: ["news"],
    queryFn: civicQueries.news
  });
  const articles = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Civic News" description="Curated public-interest news across politics, economy, security, and governance." />
      <div className="space-y-4">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={articles.length === 0}
          count={4}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No news articles available yet."
        >
          {articles.map((article) => (
          <Link key={recordId(article)} href={`/news/${recordId(article)}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-primary">{String(article.source ?? "Civic news")}</p>
              <h2 className="mt-2 text-xl font-semibold">{displayName(article)}</h2>
              <p className="mt-2 line-clamp-2 text-muted-foreground">{String(article.summary ?? article.content ?? article.description ?? "")}</p>
            </CardContent>
          </Card>
          </Link>
        ))}
        </QueryListState>
      </div>
    </div>
  );
}
