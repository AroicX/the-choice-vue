"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { OptionVotePanel } from "@/components/voting/option-vote-panel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { normalizeElection } from "@/lib/content-utils";
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

  const election = query.data ? normalizeElection(query.data) : null;
  const hasVoted = Boolean(election?.hasVoted || votedLocally);
  const status = (election?.status ?? "").toUpperCase();
  const isLive = status.includes("LIVE") || status.includes("ONGOING") || status.includes("OPEN");

  const voteMutation = useMutation({
    mutationFn: (value: string) => voteElectionMutation({ electionId, value }),
    onSuccess: () => {
      setVotedLocally(true);
      gooeyToast.success("Vote cast");
      queryClient.invalidateQueries({ queryKey: ["detail", endpoints.elections.detail(electionId)] });
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setVotedLocally(true);
      gooeyToast.error("Could not cast vote", { description: message });
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href="/elections" className="text-sm font-medium text-primary hover:underline">
          ← Back to elections
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {election?.title ?? "Election"}
        </h1>
        {election ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={isLive ? "default" : "secondary"}>{election.status}</Badge>
            {election.type ? <Badge variant="outline">{election.type}</Badge> : null}
          </div>
        ) : null}
      </div>

      {query.isLoading ? <DetailSkeleton /> : null}
      {query.isError ? (
        <Card>
          <CardContent className="p-5 text-destructive">
            {query.error instanceof Error ? query.error.message : "Could not load election."}
          </CardContent>
        </Card>
      ) : null}

      {election ? (
        <>
          {election.image ? (
            <div className="relative h-56 w-full overflow-hidden rounded-2xl border bg-muted sm:h-72">
              <Image
                src={election.image}
                alt={election.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 768px"
                priority
              />
            </div>
          ) : null}

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">About this election</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {election.description || "No description provided for this election."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  ["Status", election.status],
                  ["Type", election.type ?? "General"],
                  ["Total votes", Math.round(election.votes).toLocaleString()],
                  ["Options", String(election.options.length)],
                  ["Created", election.createdAt ? new Date(election.createdAt).toLocaleDateString() : "—"],
                  ["Updated", election.updatedAt ? new Date(election.updatedAt).toLocaleDateString() : "—"]
                ] as Array<[string, string]>).map(([label, value]) => (
                  <div key={label} className="rounded-xl border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 truncate text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">Cast your vote</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasVoted
                    ? "You have already voted in this election. Results are shown below."
                    : isLive
                      ? "Select a candidate, then confirm with Vote. You can only vote once."
                      : "Voting is closed for this election. Results are shown below."}
                </p>
              </div>

              <OptionVotePanel
                options={election.options}
                totalVotes={election.votes}
                hasVoted={hasVoted || !isLive}
                isSubmitting={voteMutation.isPending}
                disabled={!isLive}
                initialSelectedKey={election.userOption}
                onVote={(value) => {
                  if (!requireAuth("Sign in to cast your vote.")) return;
                  voteMutation.mutate(value);
                }}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
