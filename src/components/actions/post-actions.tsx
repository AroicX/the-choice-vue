"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Heart, MessageCircle, Send, ThumbsDown } from "lucide-react";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { asArray, displayName } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommentSkeleton } from "@/components/skeletons/card-skeletons";

export function PostActions({ postId, likes = 0, dislikes = 0 }: { postId: string; likes?: number; dislikes?: number }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [message, setMessage] = useState("");
  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getData<unknown>(endpoints.comments.list),
    retry: false
  });

  const comments = useMemo(
    () => asArray<ApiRecord>(commentsQuery.data).filter((comment) => String(comment.postId ?? comment.postsId ?? "") === postId),
    [commentsQuery.data, postId]
  );

  const likeMutation = useMutation({
    mutationFn: (type: "like" | "dislike") =>
      api.patch(type === "like" ? endpoints.posts.like(postId) : endpoints.posts.dislike(postId)),
    onSuccess: () => {
      gooeyToast.success("Reaction saved");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      gooeyToast.error("Reaction failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const commentMutation = useMutation({
    mutationFn: () => api.post(endpoints.comments.create(postId), { message }),
    onSuccess: () => {
      setMessage("");
      gooeyToast.success("Comment posted");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      gooeyToast.error("Comment failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { if (!requireAuth("Sign in to react to posts.")) return; likeMutation.mutate("like"); }} disabled={likeMutation.isPending}>
          <Heart className="mr-2 h-4 w-4" />Like {likes}
        </Button>
        <Button variant="outline" onClick={() => { if (!requireAuth("Sign in to react to posts.")) return; likeMutation.mutate("dislike"); }} disabled={likeMutation.isPending}>
          <ThumbsDown className="mr-2 h-4 w-4" />Dislike {dislikes}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="font-semibold">Comments</h2>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a comment"
              onFocus={() => requireAuth("Sign in to join the conversation.")}
            />
            <Button
              size="icon"
              aria-label="Send comment"
              onClick={() => { if (!requireAuth("Sign in to comment on this post.")) return; commentMutation.mutate(); }}
              disabled={!message.trim() || commentMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {commentsQuery.isLoading ? (
              <>
                <CommentSkeleton />
                <CommentSkeleton />
              </>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={String(comment.id)} className="rounded-md border p-3">
                    <p className="text-sm">{String(comment.message ?? comment.content ?? "")}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{displayName((comment.user ?? comment.createdBy ?? {}) as ApiRecord)}</p>
                  </div>
                ))}
                {comments.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><MessageCircle className="h-4 w-4" />No comments yet.</p>
                ) : null}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
