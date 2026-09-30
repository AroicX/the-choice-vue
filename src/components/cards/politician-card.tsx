"use client";

import Image from "next/image";
import Link from "next/link";
import { RoomCover } from "@/components/discourse/room-cover";
import { AppIcon } from "@/components/ui/icon";
import { ScoreRing } from "@/components/ui/score-ring";
import { ratingOfficeLabel } from "@/lib/content-utils";
import { CheckmarkBadge01Icon } from "@/lib/icons";
import type { Politician } from "@/types";

/** Singular office name for one person ("Governor", not "Governors"). */
export function officeTitle(position: string) {
  const label = ratingOfficeLabel(position);
  return label === "House of Reps" ? "House of Reps" : label.replace(/s$/, "");
}

/**
 * Compact profile card: halftone cover band (the room-cover art, coloured per
 * politician), round portrait overlapping it, name/office/party, approval
 * ring. Approval only; Performance duplicated it (status item 30).
 */
export function PoliticianCard({ politician }: { politician: Politician }) {
  const rated = politician.approvalScore > 0;
  const place = [politician.constituency, politician.state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/politicians/${politician.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-foreground/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <RoomCover seed={politician.id} text="government" className="h-16" />

      <div className="flex flex-1 flex-col px-4 pb-4">
        <span className="relative -mt-8 size-16 overflow-hidden rounded-full bg-secondary ring-4 ring-card">
          {politician.imageUrl ? (
            <Image src={politician.imageUrl} alt="" fill className="object-cover object-top" sizes="64px" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xl font-bold text-muted-foreground" aria-hidden>
              {politician.name.charAt(0)}
            </span>
          )}
        </span>

        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="truncate text-[16px] font-bold leading-5">{politician.name}</h2>
          {politician.verified ? (
            <AppIcon icon={CheckmarkBadge01Icon} size={17} className="shrink-0 text-primary" />
          ) : null}
        </div>
        <p className="truncate text-[14px] text-muted-foreground">
          {officeTitle(politician.position)}
          {place ? ` · ${place}` : ""}
        </p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
          {politician.partyImage ? (
            <Image src={politician.partyImage} alt="" width={16} height={16} className="size-4 shrink-0 rounded-full object-cover" />
          ) : null}
          <span className="truncate">{politician.party || "No party listed"}</span>
        </p>

        {/* Spacer keeps footers aligned when names or places wrap differently. */}
        <div className="min-h-4 flex-1" aria-hidden />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="flex items-center gap-2.5">
            <ScoreRing score={rated ? politician.approvalScore : null} />
            <span className="text-[13px] leading-4 text-muted-foreground">
              {rated ? (
                <>
                  Public
                  <br />
                  approval
                </>
              ) : (
                <>
                  Not yet
                  <br />
                  rated
                </>
              )}
            </span>
          </span>
          <span className="text-[14px] font-medium text-foreground group-hover:underline">View profile</span>
        </div>
      </div>
    </Link>
  );
}
