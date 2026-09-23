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
import { normalizeRatingOffice, ratingOfficeLabel } from "@/lib/content-utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { RateCandidateModal } from "@/components/cards/rate-candidate-modal";
import { voteRatingMutation } from "@/services/mutations/civic.mutations";
import type { RatingCandidate } from "@/types";

type SdgLevel = { rank: number; value: string; color?: string; votes?: number };
type SdgCriteria = Record<string, SdgLevel[]>;

/** Offices the API will return criteria for; anything else has no template. */
const RATABLE_OFFICES = ["PRESIDENCY", "HOUSE", "GOVERNOR", "SENATOR"];

export function RatingCard({ candidate }: { candidate: RatingCandidate }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [ratedLocally, setRatedLocally] = useState(false);
  const hasRated = Boolean(candidate.hasRated || ratedLocally);

  // A candidate's own `sdg` is the authoritative copy of its criteria, and the
  // only one whose categories the vote endpoint will accept. The shared
  // /ratings/sdg template is a per-office fallback for candidates that predate
  // the backfill; asking for the wrong office yields a form that cannot submit.
  const ownCriteria = candidate.criteria;
  const office = normalizeRatingOffice(candidate.position);
  const fallbackAvailable = RATABLE_OFFICES.includes(office);

  const criteriaQuery = useQuery({
    queryKey: ["ratings", "sdg-criteria", office],
    queryFn: () => getData<SdgCriteria>(endpoints.ratings.sdgCriteria(office)),
    enabled: open && !ownCriteria && fallbackAvailable,
    staleTime: 60_000,
    retry: false
  });

  const criteria = useMemo(() => {
    const payload = (ownCriteria ?? criteriaQuery.data) as SdgCriteria | undefined;
    if (!payload || typeof payload !== "object") return [] as Array<[string, SdgLevel[]]>;
    return Object.entries(payload).filter(([, levels]) => Array.isArray(levels));
  }, [ownCriteria, criteriaQuery.data]);

  const voteMutation = useMutation({
    mutationFn: () =>
      voteRatingMutation({
        candidateId: candidate.id,
        votes: Object.entries(selected).map(([type, level]) => ({ type, level, vote: 1 }))
      }),
    onSuccess: () => {
      setRatedLocally(true);
      setOpen(false);
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
            {ratingOfficeLabel(candidate.position)}
            {candidate.party ? ` · ${candidate.party}` : ""}
          </p>
          {/* The disabled "Rated" action already signals the rated state, so no
              badge here competing with the location chips for the same row. */}
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

        {/* Score and actions each get their own row. Sharing one row squeezed
            "Public score · 3 votes" into three wrapped lines. */}
        <div className="space-y-3 border-t border-border/60 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            {candidate.rated ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums leading-none">
                    {candidate.score}%
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Public score
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {candidate.totalVotes} {candidate.totalVotes === 1 ? "vote" : "votes"}
                </span>
              </>
            ) : (
              // No votes means no public score; a big "0%" would read as an
              // actual rating of zero.
              <span className="text-sm text-muted-foreground">Not yet rated</span>
            )}
          </div>

          <div className="flex gap-2">
            {candidate.politicianId ? (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/politicians/${candidate.politicianId}`}>Profile</Link>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant={hasRated ? "secondary" : "default"}
              className="flex-1"
              // Gate before opening: asking for sign-in only at submit meant
              // filling in every criterion first, then losing it to a login prompt.
              onClick={() => {
                if (!requireAuth("Sign in to rate this candidate.")) return;
                setOpen(true);
              }}
              disabled={hasRated}
            >
              {hasRated ? "Rated" : "Rate"}
            </Button>
          </div>
        </div>

      </CardContent>

      <RateCandidateModal
        open={open && !hasRated}
        onClose={() => setOpen(false)}
        candidate={candidate}
        criteria={criteria}
        selected={selected}
        onToggleLevel={(key, rank) =>
          setSelected((current) => {
            const next = { ...current };
            if (next[key] === rank) delete next[key];
            else next[key] = rank;
            return next;
          })
        }
        onSubmit={() => {
          // Still guarded: the session can expire while the modal is open.
          if (!requireAuth("Sign in to rate this candidate.")) {
            setOpen(false);
            return;
          }
          voteMutation.mutate();
        }}
        isSubmitting={voteMutation.isPending}
        isLoadingCriteria={!ownCriteria && criteriaQuery.isLoading}
        hasCriteriaError={!ownCriteria && criteriaQuery.isError}
      />
    </Card>
  );
}
