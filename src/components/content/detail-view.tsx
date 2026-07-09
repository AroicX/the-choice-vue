"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { DetailSkeleton, PostCardSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Door01Icon, FavouriteIcon } from "@/lib/icons";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import {
  asArray,
  displayName,
  isRoomMember,
  normalizeElection,
  normalizePoll,
  normalizePost,
  normalizeVoteOptions,
  recordId
} from "@/lib/content-utils";
import type { ApiRecord, RoomRecord } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth-store";
import { PostActions } from "@/components/actions/post-actions";
import { PostCard } from "@/components/cards/post-card";
import { OptionVotePanel } from "@/components/voting/option-vote-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userQueries } from "@/services/queries/user.queries";
import { voteElectionMutation, votePollMutation } from "@/services/mutations/civic.mutations";

type DetailAction = "post" | "discussion" | "poll" | "election" | "issue" | "community" | "politician" | "none";

export function DetailView({ title, endpoint, action = "none" }: { title: string; endpoint: string; action?: DetailAction }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [optimisticJoined, setOptimisticJoined] = useState(false);
  const [votedLocally, setVotedLocally] = useState(false);
  const query = useQuery({
    queryKey: ["detail", endpoint],
    queryFn: () => getData<ApiRecord>(endpoint),
    retry: false
  });

  const record = query.data;
  const id = record ? recordId(record) : "";
  const post = record && action === "post" ? normalizePost(record, userId) : null;
  const poll = record && action === "poll" ? normalizePoll(record) : null;
  const election = record && action === "election" ? normalizeElection(record) : null;
  const voteOptions = record ? normalizeVoteOptions(record) : [];
  const hasVoted = Boolean(poll?.hasVoted || election?.hasVoted || votedLocally);

  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: action === "discussion" && isAuthenticated,
    retry: false
  });
  const isMember = optimisticJoined || isRoomMember(asArray<RoomRecord>(roomsQuery.data), id);

  const relatedPostsQuery = useQuery({
    queryKey: ["discussion-posts", id],
    queryFn: () => getData<unknown>(endpoints.posts.byDiscussion(id)),
    enabled: action === "discussion" && Boolean(id),
    retry: false
  });
  const relatedPollsQuery = useQuery({
    queryKey: ["discussion-polls", id],
    queryFn: () => getData<unknown>(endpoints.polls.byDiscussion(id)),
    enabled: action === "discussion" && Boolean(id),
    retry: false
  });

  const quickAction = useMutation({
    mutationFn: async () => {
      if (!record) return;
      if (action === "discussion") return api.post(endpoints.rooms.join, { discussionsId: id, userId: user?.id });
      if (action === "issue") return api.post(endpoints.issues.upvote(id));
      if (action === "community") return api.post(endpoints.communities.join(id));
      if (action === "politician") return api.post(endpoints.follows.followPolitician(id));
    },
    onMutate: async () => {
      if (action !== "discussion") return;
      const previousJoined = optimisticJoined;
      setOptimisticJoined(true);
      return { joinedRoom: previousJoined };
    },
    onSuccess: () => {
      if (action !== "discussion") {
        gooeyToast.success("Action completed");
      } else {
        gooeyToast.success("Joined discussion");
      }
      queryClient.invalidateQueries({ queryKey: ["detail", endpoint] });
      queryClient.invalidateQueries({ queryKey: ["rooms", "me"] });
      queryClient.invalidateQueries({ queryKey: ["profile-rooms"] });
    },
    onError: (error, _value, context) => {
      if (action === "discussion") {
        setOptimisticJoined(context?.joinedRoom ?? false);
        gooeyToast.error("Could not join room");
        return;
      }
      gooeyToast.error("Action failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (value: string) => {
      if (action === "poll") return votePollMutation({ pollId: id, value });
      if (action === "election") return voteElectionMutation({ electionId: id, value });
    },
    onSuccess: () => {
      setVotedLocally(true);
      gooeyToast.success("Vote cast");
      queryClient.invalidateQueries({ queryKey: ["detail", endpoint] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      queryClient.invalidateQueries({ queryKey: ["discussion-polls"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Try again.";
      if (/already/i.test(message)) setVotedLocally(true);
      gooeyToast.error("Could not cast vote", {
        description: message
      });
    }
  });

  function runQuickAction(message: string) {
    if (!requireAuth(message)) return;
    quickAction.mutate();
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href=".." className="text-sm font-medium text-primary">Back</Link>
        <h1 className="mt-3 text-2xl font-bold">{record ? displayName(record) : title}</h1>
        {record?.status || record?.type ? <Badge className="mt-3" variant="secondary">{String(record.status ?? record.type)}</Badge> : null}
      </div>

      {query.isLoading ? (
        <DetailSkeleton />
      ) : query.error ? (
        <Card><CardContent className="p-5 text-destructive">{query.error.message}</CardContent></Card>
      ) : record ? (
        <>
          <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line leading-7">
                {String(
                  record.description ??
                  record.message ??
                  record.content ??
                  record.explanation ??
                  record.question ??
                  ""
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  ["Status", record.status ?? record.verdict ?? "Available"],
                  ["Type", record.type ?? record.position ?? record.category ?? "General"],
                  ["Updated", record.updatedAt ?? record.createdAt ?? "Not set"]
                ] as Array<[string, unknown]>).map(([label, value]) => (
                  <div key={label} className="rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{String(label)}</p>
                    <p className="mt-1 truncate text-sm font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {post ? <PostActions post={post} /> : null}

          {action === "discussion" ? (
            <div className="space-y-5">
              {!isMember ? (
                <Button
                  onClick={() => runQuickAction("Sign in to join this discussion room.")}
                  disabled={quickAction.isPending}
                >
                  <AppIcon icon={Door01Icon} size={18} className="mr-2" />
                  {quickAction.isPending ? "Joining..." : "Join room"}
                </Button>
              ) : null}
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h2 className="font-semibold">Room posts</h2>
                  {relatedPostsQuery.isLoading ? (
                    <>
                      <PostCardSkeleton />
                      <PostCardSkeleton />
                    </>
                  ) : (
                    <>
                      {asArray<ApiRecord>(relatedPostsQuery.data).map((rawPost) => {
                        const relatedPost = normalizePost(rawPost, userId);
                        return <PostCard key={relatedPost.id} post={relatedPost} showActions={isMember} />;
                      })}
                      {asArray<ApiRecord>(relatedPostsQuery.data).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No posts in this discussion yet.</p>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <h2 className="font-semibold">Room polls</h2>
                  {relatedPollsQuery.isLoading ? (
                    <div className="h-14 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <>
                      {asArray<ApiRecord>(relatedPollsQuery.data).map((rawPoll) => {
                        const relatedPoll = normalizePoll(rawPoll);
                        return (
                          <Link key={relatedPoll.id} href={`/polls/${relatedPoll.id}`} className="block rounded-md border p-3 hover:bg-accent">
                            <p className="font-medium">{relatedPoll.question}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{relatedPoll.votes.toLocaleString()} votes</p>
                          </Link>
                        );
                      })}
                      {asArray<ApiRecord>(relatedPollsQuery.data).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No polls in this discussion yet.</p>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {action === "issue" || action === "community" || action === "politician" ? (
            <Button
              onClick={() =>
                runQuickAction(
                  action === "issue"
                    ? "Sign in to upvote this issue."
                    : action === "community"
                      ? "Sign in to join this community."
                      : "Sign in to follow this politician."
                )
              }
              disabled={quickAction.isPending}
            >
              <AppIcon icon={FavouriteIcon} size={18} className="mr-2" />{action === "issue" ? "Upvote issue" : action === "community" ? "Join community" : "Follow politician"}
            </Button>
          ) : null}

          {["poll", "election"].includes(action) && voteOptions.length ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Cast your vote</h2>
                <p className="text-sm text-muted-foreground">Select an option, then confirm with Vote.</p>
                <OptionVotePanel
                  options={voteOptions}
                  totalVotes={poll?.votes ?? election?.votes}
                  hasVoted={hasVoted}
                  initialSelectedKey={poll?.userOption ?? election?.userOption}
                  isSubmitting={voteMutation.isPending}
                  onVote={(value) => {
                    if (!requireAuth("Sign in to cast your vote.")) return;
                    voteMutation.mutate(value);
                  }}
                />
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
