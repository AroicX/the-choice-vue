"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import { verdictLabel } from "@/components/cards/fact-check-row";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeFactCheck, normalizePolitician } from "@/lib/content-utils";
import { ArrowLeft01Icon, Link01Icon, Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { factChecksService } from "@/services/civic-content.service";
import { politiciansService } from "@/services/politicians.service";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord } from "@/types";

const BANNER: Record<string, string> = {
  TRUE: "bg-primary/10 text-primary",
  MOSTLY_TRUE: "bg-primary/10 text-primary",
  MIXED: "bg-secondary text-foreground",
  UNVERIFIED: "bg-secondary text-muted-foreground",
  MISLEADING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  MOSTLY_FALSE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  FALSE: "bg-destructive/10 text-destructive"
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function FactCheckDetailView({ factCheckId }: { factCheckId: string }) {
  const router = useRouter();
  const openShareModal = useShareModalStore((state) => state.open);
  const query = useQuery({
    queryKey: ["fact-check", factCheckId],
    queryFn: () => factChecksService.detail<ApiRecord>(factCheckId),
    retry: false
  });
  const factCheck = query.data ? normalizeFactCheck(query.data) : null;

  // Names and photos for the tagged politicians (was a row of identical buttons).
  const politicianQueries = useQueries({
    queries: (factCheck?.relatedPoliticianIds ?? []).map((id) => ({
      queryKey: ["politician-summary", id],
      queryFn: () => politiciansService.detail<ApiRecord>(id),
      staleTime: 300_000,
      retry: false
    }))
  });
  const politicians = politicianQueries.map((item) => (item.data ? normalizePolitician(item.data) : null)).filter(Boolean);

  const verdict = factCheck?.verdict.toUpperCase() ?? "UNVERIFIED";
  const date = factCheck?.updatedAt ?? factCheck?.createdAt;

  return (
    <>
      <div className="sticky top-[var(--app-bar,53px)] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/fact-checks"))}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight sm:text-xl">Fact check</h1>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 px-4 pt-3" aria-busy>
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : query.isError || !factCheck ? (
        <TimelineEmpty title="Fact check not found" body="It may have been removed, or the link is wrong." href="/fact-checks" action="See fact checks" />
      ) : (
        <article className="px-4 pb-10 pt-3">
          <div className={cn("rounded-xl px-4 py-3", BANNER[verdict] ?? BANNER.UNVERIFIED)}>
            <p className="text-[13px] font-medium opacity-80">Verdict</p>
            <p className="text-[22px] font-bold leading-7">{verdictLabel(verdict)}</p>
          </div>

          <blockquote className="mt-5 border-l-4 border-border pl-4 text-[22px] font-semibold leading-8 tracking-[-0.01em]">
            “{factCheck.claim}”
          </blockquote>
          {date ? (
            <p className="mt-2 text-[13px] text-muted-foreground">
              Checked {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          ) : null}

          <section className="mt-6">
            <h2 className="text-lg font-bold tracking-tight">What we found</h2>
            <p className="mt-2 whitespace-pre-line text-[16px] leading-7">
              {factCheck.explanation || "No explanation has been written for this verdict yet."}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-bold tracking-tight">Sources</h2>
            {factCheck.sources.length ? (
              <ul className="mt-2 divide-y rounded-xl border">
                {factCheck.sources.map((source) => (
                  <li key={source}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02]"
                    >
                      <AppIcon icon={Link01Icon} size={16} className="shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">{hostOf(source)}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">{source}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[15px] text-muted-foreground">No sources attached.</p>
            )}
          </section>

          {factCheck.relatedPoliticianIds.length ? (
            <section className="mt-6">
              <h2 className="text-lg font-bold tracking-tight">About</h2>
              <div className="mt-2 space-y-2">
                {politicians.map((person) =>
                  person ? (
                    <Link
                      key={person.id}
                      href={`/politicians/${person.id}`}
                      className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-foreground/[0.02]"
                    >
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                        {person.imageUrl ? <Image src={person.imageUrl} alt="" fill className="object-cover object-top" sizes="40px" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold">{person.name}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">{person.party}</span>
                      </span>
                    </Link>
                  ) : null
                )}
                {politicianQueries.some((item) => item.isLoading) ? <Skeleton className="h-16 w-full rounded-xl" /> : null}
              </div>
            </section>
          ) : null}

          <div className="mt-8 border-t pt-4">
            <Button
              variant="outline"
              onClick={() =>
                openShareModal({
                  type: "fact-check",
                  url: `${window.location.origin}/fact-checks/${factCheck.id}`,
                  author: "Choice9ja",
                  message: `“${factCheck.claim}”`,
                  status: `Fact check · ${verdictLabel(verdict)}`
                })
              }
            >
              <AppIcon icon={Share08Icon} size={16} />
              Share
            </Button>
          </div>
        </article>
      )}
    </>
  );
}
