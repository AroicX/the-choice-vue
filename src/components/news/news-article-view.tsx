"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { newsSharePayload } from "@/components/news/news-row";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeNews } from "@/lib/content-utils";
import { ArrowLeft01Icon, Link01Icon, Share08Icon } from "@/lib/icons";
import { newsService } from "@/services/civic-content.service";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord } from "@/types";

export function NewsArticleView({ articleId }: { articleId: string }) {
  const router = useRouter();
  const openShareModal = useShareModalStore((state) => state.open);
  const query = useQuery({
    queryKey: ["news", articleId],
    queryFn: () => newsService.detail<ApiRecord>(articleId),
    retry: false
  });
  const article = query.data ? normalizeNews(query.data) : null;
  const date = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      <div className="sticky top-[var(--app-bar,53px)] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/news"))}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight sm:text-xl">News</h1>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 px-4 pt-3" aria-busy>
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : query.isError || !article ? (
        <TimelineEmpty title="Article not found" body="It may have been removed, or the link is wrong." href="/news" action="See news" />
      ) : (
        <article className="px-4 pb-10 pt-3">
          {article.imageUrl ? (
            <span className="relative mb-4 block aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
              <Image src={article.imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 660px" priority />
            </span>
          ) : null}
          <p className="text-[13px] text-muted-foreground">
            {[article.source, date].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-1 text-[22px] font-bold leading-7 sm:text-[26px] sm:leading-8 tracking-[-0.02em]">{article.title}</h2>

          {article.summary ? (
            <div className="mt-4 rounded-xl bg-secondary p-4">
              <p className="text-[13px] font-semibold text-muted-foreground">In brief</p>
              <p className="mt-1 text-[16px] leading-6">{article.summary}</p>
            </div>
          ) : null}

          <div className="mt-5 space-y-4 text-[17px] leading-7">
            {article.content
              .split(/\n{2,}|\r\n\r\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 border-t pt-4">
            {article.sourceUrl ? (
              <Button asChild variant="outline">
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <AppIcon icon={Link01Icon} size={16} />
                  Read at {article.source ?? "source"}
                </a>
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => openShareModal(newsSharePayload(article))}>
              <AppIcon icon={Share08Icon} size={16} />
              Share
            </Button>
          </div>
        </article>
      )}
    </>
  );
}
