"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { voteRatingMutation } from "@/services/mutations/civic.mutations";
import type { RatingCandidate } from "@/types";

type SdgLevel = { rank: number; value: string; color?: string; votes?: number };
type SdgCriteria = Record<string, SdgLevel[]>;

function formatCriterion(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RatingCard({ candidate }: { candidate: RatingCandidate }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [ratedLocally, setRatedLocally] = useState(false);
  const hasRated = Boolean(candidate.hasRated || ratedLocally);

  const criteriaQuery = useQuery({
    queryKey: ["ratings", "sdg-criteria"],
    queryFn: () => getData<SdgCriteria>(endpoints.ratings.sdgCriteria),
    enabled: open,
    staleTime: 60_000,
    retry: false
  });

  const criteria = useMemo(() => {
    const payload = criteriaQuery.data;
    if (!payload || typeof payload !== "object") return [] as Array<[string, SdgLevel[]]>;
    return Object.entries(payload).filter(([, levels]) => Array.isArray(levels));
  }, [criteriaQuery.data]);

  const voteMutation = useMutation({
    mutationFn: () =>
      voteRatingMutation({
        candidateId: candidate.id,
        votes: Object.entries(selected).map(([type, level]) => ({ type, level, vote: 1 }))
      }),
    onSuccess: () => {
      setRatedLocally(true);
      gooeyToast.success("Rating submitted");
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setRatedLocally(true);
      gooeyToast.error("Could not submit rating", {
        description: message
      });
    }
  });

  const selectedCount = Object.keys(selected).length;
  const canSubmit = selectedCount > 0 && !hasRated && !voteMutation.isPending;

  return (
    <Card className="overflow-hidden transition-colors">
      <CardContent className="space-y-4 p-5">
        {candidate.image ? (
          <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted">
            <Image src={candidate.image} alt={candidate.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          </div>
        ) : null}

        <div className="min-w-0">
          <h2 className="font-semibold leading-5">{candidate.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {candidate.position}
            {candidate.party ? ` · ${candidate.party}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {candidate.state ? <Badge variant="secondary">{candidate.state}</Badge> : null}
            {candidate.constituency ? <Badge variant="outline">{candidate.constituency}</Badge> : null}
            {candidate.partyImage ? (
              <div className="relative h-5 w-5 overflow-hidden rounded-full bg-muted">
                <Image src={candidate.partyImage} alt={candidate.party ?? "Party"} fill className="object-cover" sizes="20px" />
              </div>
            ) : null}
          </div>
          {(candidate.education || candidate.profession) ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {[candidate.profession, candidate.education].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold">{candidate.score || "—"}{candidate.score ? "%" : ""}</p>
            <p className="text-sm text-muted-foreground">Public score</p>
          </div>
          <div className="flex gap-2">
            {candidate.politicianId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/politicians/${candidate.politicianId}`}>Profile</Link>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant={open ? "secondary" : "default"}
              onClick={() => setOpen((value) => !value)}
              disabled={hasRated}
            >
              {hasRated ? "Rated" : open ? "Hide" : "Rate"}
            </Button>
          </div>
        </div>

        {open && !hasRated ? (
          <div className="space-y-4 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">Select a score for each criterion, then submit.</p>
            {criteriaQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading criteria...</p> : null}
            {criteriaQuery.isError ? (
              <p className="text-sm text-destructive">Could not load rating criteria.</p>
            ) : null}
            <div className="space-y-4">
              {criteria.map(([key, levels]) => (
                <div key={key} className="space-y-2">
                  <p className="text-sm font-medium">{formatCriterion(key)}</p>
                  <div className="flex flex-wrap gap-2">
                    {[...levels].sort((a, b) => b.rank - a.rank).map((level) => {
                      const active = selected[key] === level.rank;
                      return (
                        <button
                          key={`${key}-${level.rank}`}
                          type="button"
                          onClick={() =>
                            setSelected((current) => {
                              const next = { ...current };
                              if (next[key] === level.rank) delete next[key];
                              else next[key] = level.rank;
                              return next;
                            })
                          }
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                            active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"
                          )}
                          style={!active && level.color ? { borderColor: level.color } : undefined}
                        >
                          {level.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{selectedCount} criteria selected</p>
              <Button
                size="sm"
                disabled={!canSubmit}
                onClick={() => {
                  if (!requireAuth("Sign in to rate this candidate.")) return;
                  voteMutation.mutate();
                }}
              >
                {voteMutation.isPending ? "Submitting..." : "Submit rating"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
