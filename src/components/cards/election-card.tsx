"use client";

import Image from "next/image";
import Link from "next/link";
import { RoomCover } from "@/components/discourse/room-cover";
import { ElectionStatusPill } from "@/components/elections/election-status";
import { electionPhase } from "@/lib/content-utils";
import type { Election } from "@/types";

const MAX_FACES = 4;

/**
 * Election list card. The whole card opens the election, where voting and
 * results live; no inline voting, so there is one place to act.
 */
export function ElectionCard({ election }: { election: Election }) {
  const phase = electionPhase(election.status);
  const faces = election.options.filter((option) => option.image).slice(0, MAX_FACES);
  const count = election.options.length;
  const votes = Math.round(election.votes);

  const action =
    phase === "live" ? (election.hasVoted ? "See results" : "Vote now") : phase === "upcoming" ? "See candidates" : "See results";
  const detail =
    phase === "upcoming"
      ? "Voting opens soon"
      : `${votes.toLocaleString()} ${votes === 1 ? "vote" : "votes"}${election.hasVoted ? " · You voted" : ""}`;

  return (
    <Link
      href={`/elections/${election.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-foreground/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        {election.image ? (
          <div className="relative h-28 bg-secondary">
            <Image src={election.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" />
          </div>
        ) : (
          <RoomCover seed={election.id} text="elections" className="h-28" />
        )}
        <ElectionStatusPill phase={phase} className="absolute left-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 text-[17px] font-bold leading-6">{election.title}</h2>
        {election.description ? (
          <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-muted-foreground">{election.description}</p>
        ) : null}

        <div className="mt-3 flex items-center gap-2.5">
          {faces.length ? (
            <span className="flex -space-x-2" aria-hidden>
              {faces.map((option) => (
                <span key={option.key} className="relative size-8 overflow-hidden rounded-full bg-secondary ring-2 ring-card">
                  <Image src={option.image!} alt="" fill className="object-cover object-top" sizes="32px" />
                </span>
              ))}
            </span>
          ) : null}
          <span className="text-[13px] text-muted-foreground">
            {count} {count === 1 ? "candidate" : "candidates"}
          </span>
        </div>

        <div className="min-h-4 flex-1" aria-hidden />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-[13px] text-muted-foreground">{detail}</span>
          <span className="text-[14px] font-medium group-hover:underline">{action}</span>
        </div>
      </div>
    </Link>
  );
}
