"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionVotePanel } from "@/components/voting/option-vote-panel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { votePollMutation } from "@/services/mutations/civic.mutations";
import type { Poll } from "@/types";

export function PollCard({ poll }: { poll: Poll }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [votedLocally, setVotedLocally] = useState(false);
  const hasVoted = Boolean(poll.hasVoted || votedLocally);

  const voteMutation = useMutation({
    mutationFn: (value: string) => votePollMutation({ pollId: poll.id, value }),
    onSuccess: () => {
      setVotedLocally(true);
      gooeyToast.success("Vote cast");
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["discussion-polls"] });
      queryClient.invalidateQueries({ queryKey: ["detail"] });
      queryClient.invalidateQueries({ queryKey: ["discourse", "polls"] });
      queryClient.invalidateQueries({ queryKey: ["shell", "polls"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setVotedLocally(true);
      gooeyToast.error("Could not cast vote", { description: message });
    }
  });

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{poll.question}</CardTitle>
          <Badge variant="secondary">{poll.expiresIn}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <OptionVotePanel
          options={poll.options}
          totalVotes={poll.votes}
          hasVoted={hasVoted}
          initialSelectedKey={poll.userOption}
          isSubmitting={voteMutation.isPending}
          onVote={(value) => {
            if (!requireAuth("Sign in to cast your vote.")) return;
            voteMutation.mutate(value);
          }}
        />
      </CardContent>
    </Card>
  );
}
