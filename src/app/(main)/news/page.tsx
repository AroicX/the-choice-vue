"use client";

import { useQuery } from "@tanstack/react-query";
import { NewsLead, NewsRow } from "@/components/news/news-row";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError } from "@/components/timeline/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { asArray, normalizeNews } from "@/lib/content-utils";
import { newsService } from "@/services/civic-content.service";
import type { ApiRecord } from "@/types";

export default function NewsPage() {
  const query = useQuery({ queryKey: ["news"], queryFn: () => newsService.list<ApiRecord>({ take: 50 }) });
  const articles = asArray<ApiRecord>(query.data).map(normalizeNews);
  const [lead, ...rest] = articles;

  return (
    <>
      <div className="sticky top-[var(--app-bar,53px)] z-20 border-b bg-background/85 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="text-[17px] font-bold tracking-tight sm:text-xl">News</h1>
        <p className="text-[13px] text-muted-foreground">Civic stories on politics, economy, security and governance</p>
      </div>
      {query.isLoading ? (
        <div aria-busy>
          <div className="space-y-2 border-b px-4 py-4">
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-6 w-4/5" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <PostRowSkeleton key={index} />
          ))}
        </div>
      ) : query.isError ? (
        <TimelineError onRetry={() => query.refetch()} what="news" />
      ) : lead ? (
        <>
          <NewsLead article={lead} />
          {rest.map((article) => (
            <NewsRow key={article.id} article={article} />
          ))}
        </>
      ) : (
        <TimelineEmpty title="No news yet" body="Civic stories will appear here as they’re published." />
      )}
    </>
  );
}
