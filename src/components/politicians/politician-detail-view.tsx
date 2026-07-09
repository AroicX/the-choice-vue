"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { asArray, normalizeIssue, normalizePolitician, normalizeScorecard } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { politiciansService } from "@/services/politicians.service";
import type { ApiRecord, Politician, Scorecard } from "@/types";

const SCORE_METRICS: Array<{ key: keyof Scorecard; label: string }> = [
  { key: "approvalRating", label: "Approval" },
  { key: "performanceScore", label: "Performance" },
  { key: "promiseDeliveryRate", label: "Promise delivery" },
  { key: "publicSentiment", label: "Public sentiment" },
  { key: "issueResponseRate", label: "Issue response" },
  { key: "factCheckScore", label: "Fact-check" },
  { key: "transparencyScore", label: "Transparency" }
];

function StatBar({ label, value }: { label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{safe.toFixed(safe % 1 ? 1 : 0)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${safe}%` }} />
      </div>
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
    queryKey: ["politicians", "compare-options"],
    queryFn: () => politiciansService.list<ApiRecord>(),
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
      .slice(0, 40);
  }, [listQuery.data, politicianId]);

  const promises = asArray<ApiRecord>(promisesQuery.data);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link href="/politicians" className="text-sm font-medium text-primary hover:underline">
          ← Back to politicians
        </Link>
      </div>

      {detailQuery.isLoading ? <DetailSkeleton /> : null}
      {detailQuery.isError ? (
        <Card>
          <CardContent className="p-5 text-destructive">
            {detailQuery.error instanceof Error ? detailQuery.error.message : "Could not load politician."}
          </CardContent>
        </Card>
      ) : null}

      {politician ? (
        <>
          <Card className="overflow-hidden">
            <CardContent className="space-y-5 p-0">
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                {politician.imageUrl ? (
                  <div className="relative min-h-56 bg-muted md:min-h-full">
                    <Image src={politician.imageUrl} alt={politician.name} fill className="object-cover" sizes="220px" priority />
                  </div>
                ) : (
                  <div className="grid min-h-56 place-items-center bg-primary/10 text-4xl font-bold text-primary md:min-h-full">
                    {politician.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{politician.name}</h1>
                        {politician.verified ? <Badge>Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {politician.position} · {politician.party}
                        {politician.state ? ` · ${politician.state}` : ""}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        if (!requireAuth("Sign in to follow this politician.")) return;
                        followMutation.mutate();
                      }}
                      disabled={followMutation.isPending}
                    >
                      {followMutation.isPending ? "Following..." : "Follow"}
                    </Button>
                  </div>

                  {politician.biography ? (
                    <p className="text-sm leading-7 text-muted-foreground">{politician.biography}</p>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Approval", `${politician.approvalScore}%`],
                      ["Performance", `${politician.performanceScore}%`],
                      ["Constituency", politician.constituency || politician.lga || politician.state],
                      ["Promises", String(politician.promiseCount ?? promises.length)],
                      ["Issues", String(politician.issueCount ?? issues.length)],
                      ["Term", politician.termStart ? `${new Date(politician.termStart).getFullYear()}–${politician.termEnd ? new Date(politician.termEnd).getFullYear() : "present"}` : "—"]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border bg-background p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {scorecard ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="font-semibold">Scorecard</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Live civic performance metrics for this politician.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {SCORE_METRICS.map((metric) => (
                    <StatBar key={metric.key} label={metric.label} value={scorecard[metric.key]} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-semibold">Compare politicians</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pick another politician for a side-by-side scorecard.</p>
                </div>
                <select
                  className="h-10 min-w-[220px] rounded-lg border bg-background px-3 text-sm"
                  value={compareId}
                  onChange={(event) => setCompareId(event.target.value)}
                >
                  <option value="">Select opponent</option>
                  {compareOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} · {option.party}
                    </option>
                  ))}
                </select>
              </div>

              {compareQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading comparison...</p> : null}
              {compareQuery.isError ? (
                <p className="text-sm text-destructive">
                  {compareQuery.error instanceof Error ? compareQuery.error.message : "Could not compare."}
                </p>
              ) : null}

              {compareQuery.data ? (
                <ComparePanel
                  left={normalizePolitician(compareQuery.data.politicianA.politician)}
                  right={normalizePolitician(compareQuery.data.politicianB.politician)}
                  metrics={compareQuery.data.metrics}
                  summary={compareQuery.data.summary}
                />
              ) : null}
            </CardContent>
          </Card>

          {politician.manifesto ? (
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">Manifesto</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{politician.manifesto}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Campaign promises</h2>
                {promisesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
                {!promisesQuery.isLoading && promises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No promises listed yet.</p>
                ) : null}
                {promises.slice(0, 6).map((promise) => (
                  <div key={String(promise.id)} className="rounded-xl border p-3">
                    <p className="text-sm font-medium">{String(promise.title ?? promise.promise ?? "Promise")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{String(promise.status ?? "Tracked")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Related issues</h2>
                {issuesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
                {!issuesQuery.isLoading && issues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No linked issues yet.</p>
                ) : null}
                {issues.slice(0, 6).map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block rounded-xl border p-3 hover:bg-accent/40">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {issue.status} · {issue.upvotes.toLocaleString()} upvotes
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
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
  metrics: Array<{ key: string; label: string; a: number; b: number; delta: number; leader: string }>;
  summary: { aWins: number; bWins: number; ties: number };
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
      </p>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{metric.label}</span>
              <span className="text-muted-foreground">
                {metric.a.toFixed(1)}% vs {metric.b.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", metric.leader === "a" ? "bg-primary" : "bg-primary/50")}
                  style={{ width: `${Math.max(0, Math.min(100, metric.a))}%` }}
                />
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", metric.leader === "b" ? "bg-emerald-500" : "bg-emerald-500/50")}
                  style={{ width: `${Math.max(0, Math.min(100, metric.b))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
