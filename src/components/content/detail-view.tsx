"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { DoorOpen, Heart, Loader2, Vote } from "lucide-react";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { displayName, normalizePost, recordId, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { PostActions } from "@/components/actions/post-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DetailAction = "post" | "discussion" | "poll" | "election" | "issue" | "community" | "politician" | "none";

export function DetailView({ title, endpoint, action = "none" }: { title: string; endpoint: string; action?: DetailAction }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["detail", endpoint],
    queryFn: () => getData<ApiRecord>(endpoint),
    retry: false
  });

  const record = query.data;
  const id = record ? recordId(record) : "";
  const post = record && action === "post" ? normalizePost(record) : null;

  const quickAction = useMutation({
    mutationFn: async (value?: string) => {
      if (!record) return;
      if (action === "discussion") return api.post(endpoints.rooms.join, { discussionsId: id });
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

  return (
    <div className="space-y-5">
      <div>
        <Link href=".." className="text-sm font-medium text-primary">Back</Link>
        <h1 className="mt-3 text-2xl font-bold">{record ? displayName(record) : title}</h1>
        {record?.status || record?.type ? <Badge className="mt-3" variant="secondary">{String(record.status ?? record.type)}</Badge> : null}
      </div>

      {query.isLoading ? (
        <Card><CardContent className="flex items-center gap-2 p-5 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading...</CardContent></Card>
      ) : query.error ? (
        <Card><CardContent className="p-5 text-destructive">{query.error.message}</CardContent></Card>
      ) : record ? (
        <>
          <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line leading-7">{String(record.description ?? record.message ?? record.content ?? record.explanation ?? "")}</p>
              <pre className="max-h-[420px] overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">{stringifyJson(record)}</pre>
            </CardContent>
          </Card>

          {post ? <PostActions postId={post.id} likes={post.likes} dislikes={post.dislikes} /> : null}

          {action === "discussion" ? (
            <Button onClick={() => quickAction.mutate(undefined)} disabled={quickAction.isPending}>
              <DoorOpen className="mr-2 h-4 w-4" />View / join room
            </Button>
          ) : null}

          {action === "issue" || action === "community" || action === "politician" ? (
            <Button onClick={() => quickAction.mutate(undefined)} disabled={quickAction.isPending}>
              <Heart className="mr-2 h-4 w-4" />{action === "issue" ? "Upvote issue" : action === "community" ? "Join community" : "Follow politician"}
            </Button>
          ) : null}

          {["poll", "election"].includes(action) && options.length ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Vote</h2>
                {options.map(([key, option]) => (
                  <Button key={key} className="w-full justify-between" variant="outline" onClick={() => quickAction.mutate(key)} disabled={quickAction.isPending}>
                    <span>{option.text ?? key}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><Vote className="h-4 w-4" />{option.value ?? 0}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
