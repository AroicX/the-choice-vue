"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { DoorOpen, Heart, Vote } from "lucide-react";
import { DetailSkeleton, PostCardSkeleton } from "@/components/skeletons/card-skeletons";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { asArray, displayName, normalizePoll, normalizePost, recordId, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth-store";
import { PostActions } from "@/components/actions/post-actions";
import { PostCard } from "@/components/cards/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DetailAction = "post" | "discussion" | "poll" | "election" | "issue" | "community" | "politician" | "none";

export function DetailView({ title, endpoint, action = "none" }: { title: string; endpoint: string; action?: DetailAction }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { requireAuth } = useRequireAuth();
  const query = useQuery({
    queryKey: ["detail", endpoint],
    queryFn: () => getData<ApiRecord>(endpoint),
    retry: false
  });

  const record = query.data;
  const id = record ? recordId(record) : "";
  const post = record && action === "post" ? normalizePost(record) : null;
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
    mutationFn: async (value?: string) => {
      if (!record) return;
      if (action === "discussion") return api.post(endpoints.rooms.join, { discussionsId: id, userId: user?.id });
      if (action === "issue") return api.post(endpoints.issues.upvote(id));
      if (action === "community") return api.post(endpoints.communities.join(id));
      if (action === "politician") return api.post(endpoints.follows.followPolitician(id));
      if (action === "poll") return api.patch(endpoints.polls.vote(id), { value });
      if (action === "election") return api.patch(endpoints.elections.vote(id), { value });
    },
    onSuccess: () => {
      gooeyToast.success("Action completed");
      queryClient.invalidateQueries({ queryKey: ["detail", endpoint] });
    },
    onError: (error) => {
      gooeyToast.error("Action failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const options = record && typeof record.options === "object" && record.options
    ? Object.entries(record.options as Record<string, { text?: string; value?: number }>)
    : [];

  function runQuickAction(message: string, value?: string) {
    if (!requireAuth(message)) return;
    quickAction.mutate(value);
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
              <p className="whitespace-pre-line leading-7">{String(record.description ?? record.message ?? record.content ?? record.explanation ?? "")}</p>
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

          {post ? <PostActions postId={post.id} likes={post.likes} dislikes={post.dislikes} /> : null}

          {action === "discussion" ? (
            <div className="space-y-5">
              <Button onClick={() => runQuickAction("Sign in to join this discussion room.")} disabled={quickAction.isPending}>
                <DoorOpen className="mr-2 h-4 w-4" />Join room
              </Button>
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
                        const relatedPost = normalizePost(rawPost);
                        return <PostCard key={relatedPost.id} post={relatedPost} />;
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
                        const poll = normalizePoll(rawPoll);
                        return (
                          <Link key={poll.id} href={`/polls/${poll.id}`} className="block rounded-md border p-3 hover:bg-accent">
                            <p className="font-medium">{poll.question}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{poll.votes.toLocaleString()} votes</p>
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
              <Heart className="mr-2 h-4 w-4" />{action === "issue" ? "Upvote issue" : action === "community" ? "Join community" : "Follow politician"}
            </Button>
          ) : null}

          {["poll", "election"].includes(action) && options.length ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Vote</h2>
                {options.map(([key, option]) => (
                  <div key={key} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{option.text ?? key}</p>
                        <p className="text-sm text-muted-foreground">{Number(option.value ?? 0).toLocaleString()} votes</p>
                      </div>
                      <Button variant="outline" onClick={() => runQuickAction("Sign in to cast your vote.", key)} disabled={quickAction.isPending}>
                        <Vote className="mr-2 h-4 w-4" />Vote
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <details className="rounded-md border bg-card p-4">
            <summary className="cursor-pointer text-sm font-medium">Raw API data</summary>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">{stringifyJson(record)}</pre>
          </details>
        </>
      ) : null}
    </div>
  );
}
