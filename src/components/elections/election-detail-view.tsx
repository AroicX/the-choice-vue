"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { RoomCover } from "@/components/discourse/room-cover";
import { Ballot } from "@/components/elections/ballot";
import { ElectionStatusPill } from "@/components/elections/election-status";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft01Icon, Share08Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { electionSharePayload } from "@/components/elections/share-election";
import { useShareModalStore } from "@/stores/share-modal-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { electionPhase, normalizeElection } from "@/lib/content-utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { voteElectionMutation } from "@/services/mutations/civic.mutations";
import type { ApiRecord } from "@/types";

export function ElectionDetailView({ electionId }: { electionId: string }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [votedLocally, setVotedLocally] = useState(false);

  const query = useQuery({
    queryKey: ["detail", endpoints.elections.detail(electionId)],
    queryFn: () => getData<ApiRecord>(endpoints.elections.detail(electionId)),
    retry: false
  });

  const openShareModal = useShareModalStore((state) => state.open);
  const election = query.data ? normalizeElection(query.data) : null;
  const hasVoted = Boolean(election?.hasVoted || votedLocally);
  const phase = electionPhase(election?.status ?? "");

  const voteMutation = useMutation({
    mutationFn: (value: string) => voteElectionMutation({ electionId, value }),
    onSuccess: () => {
      setVotedLocally(true);
      gooeyToast.success("Your vote is in");
      queryClient.invalidateQueries({ queryKey: ["detail", endpoints.elections.detail(electionId)] });
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setVotedLocally(true);
      gooeyToast.error("Couldn’t cast your vote", { description: message });
    }
  });

  const votes = Math.round(election?.votes ?? 0);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/elections"
        className="-ml-2 inline-flex h-9 items-center gap-0.5 rounded-full pl-1.5 pr-3.5 text-[15px] font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AppIcon icon={ArrowLeft01Icon} size={20} />
        Elections
      </Link>

      {query.isLoading ? (
        <div className="mt-4 space-y-3" aria-busy>
          <Skeleton className="aspect-[3/1] w-full rounded-xl" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[74px] w-full rounded-xl" />
          ))}
        </div>
      ) : query.isError || !election ? (
        <TimelineEmpty title="Election not found" body="It may have been removed, or the link is wrong." href="/elections" action="Back to elections" />
      ) : (
        <>
          <div className="relative mt-4 overflow-hidden rounded-xl">
            {election.image ? (
              <div className="relative aspect-[3/1] bg-secondary">
                <Image src={election.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 672px" priority />
              </div>
            ) : (
              <RoomCover seed={election.id} text="elections" className="aspect-[3/1] w-full" />
            )}
            <ElectionStatusPill phase={phase} className="absolute left-3 top-3" />
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="text-[22px] font-bold leading-7 sm:text-[26px] sm:leading-8 tracking-[-0.02em]">{election.title}</h1>
            <Button variant="outline" className="shrink-0" onClick={() => openShareModal(electionSharePayload(election))}>
              <AppIcon icon={Share08Icon} size={16} />
              Share
            </Button>
          </div>
          <p className="mt-1 flex flex-wrap gap-x-4 text-[15px] text-muted-foreground">
            <span>
              <strong className="font-bold text-foreground">{election.options.length}</strong> candidates
            </span>
            {phase !== "upcoming" ? (
              <span>
                <strong className="font-bold text-foreground">{votes.toLocaleString()}</strong> {votes === 1 ? "vote" : "votes"}
              </span>
            ) : null}
            {election.type ? <span className="capitalize">{election.type.toLowerCase().replaceAll("_", " ")}</span> : null}
          </p>
          {election.description ? (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-6">{election.description}</p>
          ) : null}

          <section className="mt-6 border-t pt-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight">
              {phase === "upcoming" ? "Candidates" : phase === "closed" ? "Results" : hasVoted ? "Live results" : "Cast your vote"}
            </h2>
            <Ballot
              phase={phase}
              options={election.options}
              totalVotes={election.votes}
              hasVoted={hasVoted}
              votedKey={election.userOption}
              isSubmitting={voteMutation.isPending}
              onBeforeSelect={() => requireAuth("Sign in to cast your vote.")}
              onVote={(value) => {
                if (!requireAuth("Sign in to cast your vote.")) return;
                voteMutation.mutate(value);
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}
