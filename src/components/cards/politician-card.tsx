"use client";

import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { ratingOfficeLabel } from "@/lib/content-utils";
import { CheckmarkBadge01Icon } from "@/lib/icons";
import type { Politician } from "@/types";

/** Singular office name for one person ("Governor", not "Governors"). */
export function officeTitle(position: string) {
  const label = ratingOfficeLabel(position);
  return label === "House of Reps" ? "House of Reps" : label.replace(/s$/, "");
}

/**
 * Profile card: portrait, name, office and place, party, approval. The whole
 * card is the link. Approval only; Performance duplicated it (status item 30).
 */
export function PoliticianCard({ politician }: { politician: Politician }) {
  const rated = politician.approvalScore > 0;
  const place = [politician.constituency, politician.state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/politicians/${politician.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:bg-foreground/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] bg-secondary">
        {politician.imageUrl ? (
          <Image
            src={politician.imageUrl}
            alt=""
            fill
            // Portraits: anchor to the top so heads aren't cropped off.
            className="object-cover object-top"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-muted-foreground" aria-hidden>
            {politician.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-[17px] font-bold leading-6">{politician.name}</h2>
          {politician.verified ? (
            <AppIcon icon={CheckmarkBadge01Icon} size={18} className="shrink-0 text-primary" />
          ) : null}
        </div>
        <p className="truncate text-[14px] text-muted-foreground">
          {officeTitle(politician.position)}
          {place ? ` · ${place}` : ""}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t pt-3">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
            {politician.partyImage ? (
              <Image src={politician.partyImage} alt="" width={20} height={20} className="size-5 shrink-0 rounded-full object-cover" />
            ) : null}
            <span className="truncate">{politician.party || "No party listed"}</span>
          </span>
          {rated ? (
            <span className="shrink-0 text-right">
              <span className="block text-xl font-bold leading-6 tabular-nums">{Math.round(politician.approvalScore)}%</span>
              <span className="block text-[12px] text-muted-foreground">approval</span>
            </span>
          ) : (
            <span className="shrink-0 text-[13px] text-muted-foreground">Not yet rated</span>
          )}
        </div>
      </div>
    </Link>
  );
}
