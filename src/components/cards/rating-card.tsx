"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { officeTitle } from "@/components/cards/politician-card";
import { AppIcon } from "@/components/ui/icon";
import { CheckmarkCircle02Icon } from "@/lib/icons";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { normalizeRatingOffice } from "@/lib/content-utils";
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

  const place = [candidate.constituency, candidate.state].filter(Boolean).join(", ");
  const background = [candidate.profession, candidate.education].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-[4/3] bg-secondary">
        {candidate.image ? (
          <Image
            src={candidate.image}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-muted-foreground" aria-hidden>
            {candidate.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="truncate text-[17px] font-bold leading-6">{candidate.name}</h2>
        <p className="truncate text-[14px] text-muted-foreground">
          {officeTitle(candidate.position)}
          {place ? ` · ${place}` : ""}
        </p>
        <p className="mt-1 flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
          {candidate.partyImage ? (
            <Image src={candidate.partyImage} alt="" width={18} height={18} className="size-[18px] shrink-0 rounded-full object-cover" />
          ) : null}
          <span className="truncate">{[candidate.party, background].filter(Boolean).join(" · ") || " "}</span>
        </p>

        {/* Spacer keeps footers aligned across cards with more or less detail. */}
        <div className="min-h-4 flex-1" aria-hidden />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          {candidate.rated ? (
            <span>
              <span className="block text-xl font-bold leading-6 tabular-nums">{candidate.score}%</span>
              <span className="block text-[12px] text-muted-foreground">
                {candidate.totalVotes.toLocaleString()} {candidate.totalVotes === 1 ? "rating" : "ratings"}
              </span>
            </span>
          ) : (
            // No votes means no public score; "0%" would read as a real rating.
            <span className="text-[13px] text-muted-foreground">Not yet rated</span>
          )}

          <div className="flex shrink-0 items-center gap-1">
            {candidate.politicianId ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/politicians/${candidate.politicianId}`}>Profile</Link>
              </Button>
            ) : null}
            {hasRated ? (
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-bold text-muted-foreground">
                <AppIcon icon={CheckmarkCircle02Icon} size={16} />
                Rated
              </span>
            ) : (
              <Button
                size="sm"
                // Gate before opening: asking for sign-in only at submit meant
                // filling in every criterion first, then losing it to a login prompt.
                onClick={() => {
                  if (!requireAuth("Sign in to rate this candidate.")) return;
                  setOpen(true);
                }}
              >
                Rate
              </Button>
            )}
          </div>
        </div>
      </div>

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
    </article>
  );
}
