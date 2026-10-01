"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime, type NewsArticle } from "@/lib/content-utils";
import type { SharePayload } from "@/stores/share-modal-store";

export function newsSharePayload(article: NewsArticle): SharePayload {
  return {
    type: "news",
    url: `${window.location.origin}/news/${article.id}`,
    author: "Choice9ja",
    message: article.title,
    status: ["News", article.source].filter(Boolean).join(" · ")
  };
}

function Byline({ article }: { article: NewsArticle }) {
  const time = formatRelativeTime(article.publishedAt);
  return (
    <p className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
      {article.source ? <span className="truncate font-semibold text-foreground">{article.source}</span> : null}
      {article.source && time ? <span aria-hidden>·</span> : null}
      {time ? <span className="shrink-0">{time}</span> : null}
    </p>
  );
}

/** The newest story, large, with its image. */
export function NewsLead({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.id}`} className="block border-b px-4 py-4 transition-colors hover:bg-foreground/[0.02]">
      {article.imageUrl ? (
        <span className="relative mb-3 block aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
          <Image src={article.imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 660px" priority />
        </span>
      ) : null}
      <Byline article={article} />
      <h2 className="mt-1 text-[22px] font-bold leading-7 tracking-[-0.01em]">{article.title}</h2>
      {article.summary || article.content ? (
        <p className="mt-1.5 line-clamp-3 text-[15px] leading-5 text-muted-foreground">{article.summary ?? article.content}</p>
      ) : null}
    </Link>
  );
}

/** A story in the list: text left, thumbnail right. */
export function NewsRow({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.id}`} className="flex gap-3 border-b px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
      <span className="min-w-0 flex-1">
        <Byline article={article} />
        <span className="mt-0.5 line-clamp-2 block text-[16px] font-bold leading-5">{article.title}</span>
        {article.summary || article.content ? (
          <span className="mt-1 line-clamp-2 block text-[14px] leading-5 text-muted-foreground">{article.summary ?? article.content}</span>
        ) : null}
      </span>
      {article.imageUrl ? (
        <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
          <Image src={article.imageUrl} alt="" fill className="object-cover" sizes="80px" />
        </span>
      ) : null}
    </Link>
  );
}
