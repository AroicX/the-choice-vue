"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptionVotePanel } from "@/components/voting/option-vote-panel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { voteElectionMutation } from "@/services/mutations/civic.mutations";
import type { Election } from "@/types";

export function ElectionCard({ election, compact = false }: { election: Election; compact?: boolean }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [votedLocally, setVotedLocally] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const hasVoted = Boolean(election.hasVoted || votedLocally);
  const status = election.status.toUpperCase();
  const isLive = status.includes("LIVE") || status.includes("ONGOING") || status.includes("OPEN");
  const optionImages = election.options.filter((option) => Boolean(option.image?.trim()));
  const coverImage = election.image?.trim() || optionImages[0]?.image;

  const voteMutation = useMutation({
    mutationFn: (value: string) => voteElectionMutation({ electionId: election.id, value }),
    onSuccess: () => {
      setVotedLocally(true);
      gooeyToast.success("Vote cast");
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      queryClient.invalidateQueries({ queryKey: ["detail"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setVotedLocally(true);
      gooeyToast.error("Could not cast vote", { description: message });
    }
  });

  return (
    <Card className="animate-fade-up overflow-hidden">
      {coverImage ? (
        <div className="relative h-40 w-full bg-muted sm:h-44">
          <Image
            src={coverImage}
            alt={election.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3">
            <Badge variant={isLive ? "default" : "secondary"}>{election.status}</Badge>
          </div>
        </div>
      ) : null}

      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold leading-6">{election.title}</h2>
            {election.type ? <p className="mt-1 text-sm text-muted-foreground">{election.type}</p> : null}
          </div>
          {!coverImage ? <Badge variant={isLive ? "default" : "secondary"}>{election.status}</Badge> : null}
        </div>

        {election.description && expanded ? (
          <p className="text-sm leading-6 text-muted-foreground line-clamp-3">{election.description}</p>
        ) : null}

        {!expanded && optionImages.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {optionImages.slice(0, 4).map((option) => (
              <div key={option.key} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
                <Image src={option.image!} alt={option.label} fill className="object-cover" sizes="64px" />
              </div>
            ))}
            {optionImages.length > 4 ? (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border bg-muted text-xs font-semibold text-muted-foreground">
                +{optionImages.length - 4}
              </div>
            ) : null}
          </div>
        ) : null}

        {expanded ? (
          <OptionVotePanel
            options={election.options}
            totalVotes={election.votes}
            hasVoted={hasVoted || !isLive}
            disabled={!isLive}
            initialSelectedKey={election.userOption}
            isSubmitting={voteMutation.isPending}
            onVote={(value) => {
              if (!requireAuth("Sign in to cast your vote.")) return;
              voteMutation.mutate(value);
            }}
          />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {election.options.length} options · {Math.round(election.votes).toLocaleString()} votes
              {hasVoted ? " · Voted" : ""}
            </p>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setExpanded(true)}>
              {hasVoted || !isLive ? "View results" : "Vote"}
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" className="px-0" asChild>
          <Link href={`/elections/${election.id}`}>Open election</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
