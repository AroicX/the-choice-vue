"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { officeTitle } from "@/components/cards/politician-card";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown01Icon, ArrowLeft01Icon, CheckmarkBadge01Icon } from "@/lib/icons";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { asArray, normalizeIssue, normalizePolitician, normalizeScorecard } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { politiciansService } from "@/services/politicians.service";
import type { ApiRecord, Politician, Scorecard, ScorecardCoverage } from "@/types";

type ScoreMetricKey = Exclude<keyof Scorecard, "rated" | "totalVotes" | "coverage">;

/** Derived from public votes; meaningless (and misleading) with none. */
const VOTE_BACKED_METRICS: ScoreMetricKey[] = [
  "approvalRating",
  "performanceScore",
  "publicSentiment"
];

// `source` is the coverage count behind the metric; with 0 inputs its value
// is a placeholder, so it reads "No data" instead of a confident 0%.
const SCORE_METRICS: Array<{ key: ScoreMetricKey; label: string; source: keyof ScorecardCoverage | null }> = [
  { key: "approvalRating", label: "Approval", source: "votes" },
  { key: "performanceScore", label: "Performance", source: "votes" },
  { key: "promiseDeliveryRate", label: "Promise delivery", source: "promises" },
  { key: "publicSentiment", label: "Public sentiment", source: "votes" },
  { key: "issueResponseRate", label: "Issue response", source: "issues" },
  { key: "factCheckScore", label: "Fact-check", source: "factChecks" },
  { key: "transparencyScore", label: "Transparency", source: null }
];

function StatBar({ label, value, noData = false }: { label: string; value: number; noData?: boolean }) {
  const safe = noData ? 0 : Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[15px]">
        <span>{label}</span>
        {noData ? (
          <span className="text-muted-foreground">No data</span>
        ) : (
          <span className="font-bold tabular-nums">{safe.toFixed(safe % 1 ? 1 : 0)}%</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

/** Plain section: hairline on top, bold heading, optional muted subtitle. */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-6">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Biographies arrive with real newlines, but a single <p> collapses them into
 * one unbroken wall of text. Split them back into paragraphs and collapse long
 * ones so the profile stays scannable.
 */
function Biography({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = useMemo(
    () =>
      text
        .split(/\n+/)
        .map((part) => part.trim())
        .filter(Boolean),
    [text]
  );

  if (!paragraphs.length) return null;

  const isLong = text.length > 420 || paragraphs.length > 2;
  const visible = expanded || !isLong ? paragraphs : paragraphs.slice(0, 1);

  return (
    <div className="space-y-3">
      <div className="space-y-3 text-[15px] leading-6">
        {visible.map((paragraph, index) => (
          <p key={index} className={!expanded && isLong && index === 0 ? "line-clamp-4" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-[15px] text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

export function PoliticianDetailView({ politicianId }: { politicianId: string }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [compareId, setCompareId] = useState("");

  const detailQuery = useQuery({
    queryKey: ["politician", politicianId],
    queryFn: () => politiciansService.scorecardBundle<{ politician: ApiRecord; scorecard: ApiRecord }>(politicianId),
    retry: false
  });

  const listQuery = useQuery({
    queryKey: ["politicians", "all"],
    // Every page; a single list call stopped at the API's default of 20.
    queryFn: () => politiciansService.listAll<ApiRecord>(),
    staleTime: 60_000
  });

  const promisesQuery = useQuery({
    queryKey: ["politician", politicianId, "promises"],
    queryFn: () => politiciansService.promises<ApiRecord>(politicianId),
    retry: false
  });

  const issuesQuery = useQuery({
    queryKey: ["politician", politicianId, "issues"],
    queryFn: () => politiciansService.issues<ApiRecord>(politicianId),
    retry: false
  });

  const compareQuery = useQuery({
    queryKey: ["politicians", "compare", politicianId, compareId],
    queryFn: () =>
      politiciansService.compare<{
        politicianA: { politician: ApiRecord; scorecard: ApiRecord };
        politicianB: { politician: ApiRecord; scorecard: ApiRecord };
        metrics: Array<{ key: string; label: string; a: number; b: number; delta: number; leader: string }>;
        summary: { aWins: number; bWins: number; ties: number };
      }>(politicianId, compareId),
    enabled: Boolean(compareId),
    retry: false
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(endpoints.follows.followPolitician(politicianId)),
    onSuccess: () => {
      gooeyToast.success("Following politician");
      queryClient.invalidateQueries({ queryKey: ["politician", politicianId] });
    },
    onError: (error) => {
      gooeyToast.error("Could not follow", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  const politician = detailQuery.data?.politician
    ? normalizePolitician(detailQuery.data.politician)
    : null;
  const scorecard = detailQuery.data?.scorecard
    ? normalizeScorecard(detailQuery.data.scorecard)
    : null;

  const compareOptions = useMemo(() => {
    return asArray<ApiRecord>(listQuery.data)
      .map(normalizePolitician)
      .filter((item) => item.id !== politicianId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [listQuery.data, politicianId]);

  const promises = asArray<ApiRecord>(promisesQuery.data);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);

  const place = politician ? [politician.constituency || politician.lga, politician.state].filter(Boolean).join(", ") : "";
  const term = politician?.termStart
    ? `${new Date(politician.termStart).getFullYear()}–${politician.termEnd ? new Date(politician.termEnd).getFullYear() : "present"}`
    : null;
  const promiseCount = politician?.promiseCount ?? promises.length;
  const issueCount = politician?.issueCount ?? issues.length;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/politicians"
        className="-ml-2 inline-flex h-9 items-center gap-0.5 rounded-full pl-1.5 pr-3.5 text-[15px] font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AppIcon icon={ArrowLeft01Icon} size={20} />
        Politicians
      </Link>

      {detailQuery.isLoading ? (
        <div className="mt-6 space-y-3" aria-busy>
          <Skeleton className="size-32 rounded-full" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : null}
      {detailQuery.isError ? (
        <TimelineEmpty title="Profile not found" body="It may have been removed, or the link is wrong." href="/politicians" action="Back to politicians" />
      ) : null}

      {politician ? (
        <>
          <header className="pb-6 pt-6">
            {/* Portrait on its own row, as a circle anchored to the top of the photo. */}
            <div className="relative size-32 overflow-hidden rounded-full bg-secondary ring-4 ring-background">
              {politician.imageUrl ? (
                <Image
                  src={politician.imageUrl}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="128px"
                  priority
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-muted-foreground" aria-hidden>
                  {politician.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="flex items-center gap-1.5 text-[22px] font-bold leading-7 sm:text-[26px] sm:leading-8 tracking-[-0.02em]">
                  <span className="min-w-0">{politician.name}</span>
                  {politician.verified ? (
                    <AppIcon icon={CheckmarkBadge01Icon} size={22} className="shrink-0 text-primary" />
                  ) : null}
                </h1>
                <p className="mt-0.5 text-[15px] text-muted-foreground">
                  {officeTitle(politician.position)}
                  {place ? ` · ${place}` : ""}
                  {term ? ` · ${term}` : ""}
                </p>
              </div>
              <Button
                variant="inverted"
                className="shrink-0"
                onClick={() => {
                  if (!requireAuth("Sign in to follow this politician.")) return;
                  followMutation.mutate();
                }}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending ? "Following…" : "Follow"}
              </Button>
            </div>

            {politician.party ? (
              <p className="mt-3 flex items-center gap-2 text-[15px]">
                {politician.partyImage ? (
                  <Image src={politician.partyImage} alt="" width={20} height={20} className="size-5 rounded-full object-cover" />
                ) : null}
                {politician.party}
              </p>
            ) : null}

            {politician.biography ? (
              <div className="mt-4">
                <Biography text={politician.biography} />
              </div>
            ) : null}

            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted-foreground">
              <span>
                <strong className="font-bold text-foreground">{promiseCount.toLocaleString()}</strong>{" "}
                {promiseCount === 1 ? "promise" : "promises"}
              </span>
              <span>
                <strong className="font-bold text-foreground">{issueCount.toLocaleString()}</strong>{" "}
                {issueCount === 1 ? "issue" : "issues"}
              </span>
              <span>
                <strong className="font-bold text-foreground">{(scorecard?.totalVotes ?? 0).toLocaleString()}</strong>{" "}
                {scorecard?.totalVotes === 1 ? "rating" : "ratings"}
              </span>
            </p>
          </header>

          {scorecard ? (
            <Section title="Scorecard">
              <div className="mb-5 flex items-baseline gap-3">
                {scorecard.rated ? (
                  <>
                    <span className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">{Math.round(scorecard.approvalRating)}%</span>
                    <span className="text-[15px] text-muted-foreground">
                      approval from {scorecard.totalVotes.toLocaleString()} {scorecard.totalVotes === 1 ? "rating" : "ratings"}
                    </span>
                  </>
                ) : (
                  // With no votes behind it, a 0% would read as a measured score.
                  <span className="text-[15px] text-muted-foreground">
                    Not rated yet. Approval appears once people start rating this leader.
                  </span>
                )}
              </div>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {SCORE_METRICS.filter(
                  (metric) => metric.key !== "approvalRating" && (scorecard.rated || !VOTE_BACKED_METRICS.includes(metric.key))
                ).map((metric) => (
                  <StatBar
                    key={metric.key}
                    label={metric.label}
                    value={scorecard[metric.key]}
                    noData={metric.source ? scorecard.coverage[metric.source] === 0 : false}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Compare" subtitle="See this leader side by side with another.">
            <div className="relative w-full sm:w-72">
              <select
                aria-label="Politician to compare with"
                className="h-10 w-full appearance-none rounded-full border border-input bg-transparent pl-4 pr-9 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={compareId}
                onChange={(event) => setCompareId(event.target.value)}
              >
                <option value="">Choose a politician</option>
                {compareOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                    {option.party ? ` · ${option.party}` : ""}
                  </option>
                ))}
              </select>
              <AppIcon
                icon={ArrowDown01Icon}
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>

            {compareQuery.isLoading ? <p className="mt-4 text-[15px] text-muted-foreground">Loading comparison…</p> : null}
            {compareQuery.isError ? (
              <p className="mt-4 text-[15px] text-destructive">
                {compareQuery.error instanceof Error ? compareQuery.error.message : "Could not compare."}
              </p>
            ) : null}
            {compareQuery.data ? (
              <div className="mt-4">
                <ComparePanel
                  left={normalizePolitician(compareQuery.data.politicianA.politician)}
                  right={normalizePolitician(compareQuery.data.politicianB.politician)}
                  metrics={compareQuery.data.metrics}
                  summary={compareQuery.data.summary}
                />
              </div>
            ) : null}
          </Section>

          {politician.manifesto ? (
            <Section title="Manifesto">
              <p className="whitespace-pre-line text-[15px] leading-6">{politician.manifesto}</p>
            </Section>
          ) : null}

          <Section title="Campaign promises">
            {promisesQuery.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : promises.length ? (
              <ul className="divide-y">
                {promises.slice(0, 8).map((promise) => (
                  <li key={String(promise.id)} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-[15px]">{String(promise.title ?? promise.promise ?? "Promise")}</span>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-semibold capitalize text-muted-foreground">
                      {String(promise.status ?? "tracked").toLowerCase().replaceAll("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-muted-foreground">No promises recorded yet.</p>
            )}
          </Section>

          <Section title="Related issues">
            {issuesQuery.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : issues.length ? (
              <ul className="divide-y">
                {issues.slice(0, 8).map((issue) => (
                  <li key={issue.id}>
                    <Link href={`/issues/${issue.id}`} className="-mx-2 block rounded-lg px-2 py-3 transition-colors hover:bg-foreground/[0.03]">
                      <span className="block text-[15px] font-medium">{issue.title}</span>
                      <span className="block text-[13px] capitalize text-muted-foreground">
                        {issue.status.toLowerCase().replaceAll("_", " ")} · {issue.upvotes.toLocaleString()}{" "}
                        {issue.upvotes === 1 ? "upvote" : "upvotes"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-muted-foreground">No issues linked to this leader yet.</p>
            )}
          </Section>
        </>
      ) : null}
    </div>
  );
}

function ComparePanel({
  left,
  right,
  metrics,
  summary
}: {
  left: Politician;
  right: Politician;
  metrics: Array<{
    key: string;
    label: string;
    a: number;
    b: number;
    delta: number;
    leader: string;
    aHasData?: boolean;
    bHasData?: boolean;
  }>;
  summary: { aWins: number; bWins: number; ties: number; noData?: number };
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {[left, right].map((person, index) => (
          <div key={person.id} className="rounded-xl border p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{index === 0 ? "Politician A" : "Politician B"}</p>
            <p className="mt-1 font-semibold">{person.name}</p>
            <p className="text-sm text-muted-foreground">{person.party} · {person.position}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {left.name} leads in {summary.aWins} metrics · {right.name} leads in {summary.bWins} · {summary.ties} ties
        {summary.noData ? ` · ${summary.noData} not yet measurable` : ""}
      </p>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{metric.label}</span>
              <span className="text-muted-foreground">
                {metric.aHasData === false ? "No data" : `${metric.a.toFixed(1)}%`} vs{" "}
                {metric.bHasData === false ? "No data" : `${metric.b.toFixed(1)}%`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", metric.leader === "a" ? "bg-primary" : "bg-primary/50")}
                  style={{ width: `${metric.aHasData === false ? 0 : Math.max(0, Math.min(100, metric.a))}%` }}
                />
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", metric.leader === "b" ? "bg-emerald-500" : "bg-emerald-500/50")}
                  style={{ width: `${metric.bHasData === false ? 0 : Math.max(0, Math.min(100, metric.b))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
