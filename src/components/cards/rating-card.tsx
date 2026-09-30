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
import { cn } from "@/lib/utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { RateCandidateModal } from "@/components/cards/rate-candidate-modal";
import { voteRatingMutation } from "@/services/mutations/civic.mutations";
import type { RatingCandidate } from "@/types";

type SdgLevel = { rank: number; value: string; color?: string; votes?: number };
type SdgCriteria = Record<string, SdgLevel[]>;

/** Offices the API will return criteria for; anything else has no template. */
const RATABLE_OFFICES = ["PRESIDENCY", "HOUSE", "GOVERNOR", "SENATOR"];

/** Circular approval meter; a dashed empty ring when nobody has rated yet. */
function ScoreRing({ score }: { score: number | null }) {
  const size = 52;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score === null ? 0 : Math.max(0, Math.min(100, score));

  return (
    <span
      className="relative grid size-[52px] shrink-0 place-items-center"
      role="img"
      aria-label={score === null ? "No public score yet" : `Public approval ${Math.round(value)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
          strokeDasharray={score === null ? "3 4" : undefined}
        />
        {score !== null ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          />
        ) : null}
      </svg>
      <span className={cn("text-[13px] font-bold tabular-nums", score === null && "text-muted-foreground")}>
        {score === null ? "—" : `${Math.round(value)}%`}
      </span>
    </span>
  );
}

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

  return (
    <article className="flex flex-col rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3.5">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-secondary">
          {candidate.image ? (
            <Image src={candidate.image} alt="" fill className="object-cover object-top" sizes="56px" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-lg font-bold text-muted-foreground" aria-hidden>
              {candidate.name.charAt(0)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="truncate text-[16px] font-bold leading-5">{candidate.name}</h2>
          <p className="truncate text-[14px] text-muted-foreground">
            {officeTitle(candidate.position)}
            {place ? ` · ${place}` : ""}
          </p>
          {candidate.party ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              {candidate.partyImage ? (
                <Image src={candidate.partyImage} alt="" width={16} height={16} className="size-4 rounded-full object-cover" />
              ) : null}
              <span className="truncate">{candidate.party}</span>
            </p>
          ) : null}
        </div>

        <ScoreRing score={candidate.rated ? candidate.score : null} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <p className="min-w-0 truncate text-[13px] text-muted-foreground">
          {/* No votes means no public score; "0%" would read as a real rating. */}
          {candidate.rated
            ? `${candidate.totalVotes.toLocaleString()} ${candidate.totalVotes === 1 ? "rating" : "ratings"}`
            : "No ratings yet"}
          {candidate.politicianId ? (
            <>
              {" · "}
              <Link href={`/politicians/${candidate.politicianId}`} className="text-foreground hover:underline">
                Profile
              </Link>
            </>
          ) : null}
        </p>
        {hasRated ? (
          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-secondary px-4 text-sm font-medium text-muted-foreground">
            <AppIcon icon={CheckmarkCircle02Icon} size={16} />
            Rated
          </span>
        ) : (
          <Button
            size="sm"
            className="shrink-0"
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
