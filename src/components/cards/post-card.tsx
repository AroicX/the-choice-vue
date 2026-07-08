"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Bookmark, Heart, MessageCircle, Share2, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { Post } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const action = useMutation({
    mutationFn: (type: "like" | "dislike") =>
      api.patch(type === "like" ? endpoints.posts.like(post.id) : endpoints.posts.dislike(post.id)),
    onSuccess: () => {
      gooeyToast.success("Reaction saved");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
    onError: (error) => {
      gooeyToast.error("Reaction failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  async function sharePost() {
    const url = `${window.location.origin}/threads/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: post.topic, text: post.message, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    gooeyToast.success("Post link copied");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{post.author}</p>
            <p className="text-sm text-muted-foreground">{post.handle} in {post.topic}</p>
          </div>
          {post.badge ? <Badge variant="secondary">{post.badge}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-7 text-foreground">{post.message}</p>
        <div className="mt-5 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => { if (!requireAuth("Sign in to react to posts.")) return; action.mutate("like"); }} disabled={action.isPending}><Heart className="mr-2 h-4 w-4" />{post.likes}</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (!requireAuth("Sign in to react to posts.")) return; action.mutate("dislike"); }} disabled={action.isPending}><ThumbsDown className="mr-2 h-4 w-4" />{post.dislikes ?? 0}</Button>
          <Button variant="ghost" size="sm" asChild><Link href={`/threads/post/${post.id}`}><MessageCircle className="mr-2 h-4 w-4" />{post.comments}</Link></Button>
          <Button variant="ghost" size="sm" onClick={sharePost}><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <Button variant="ghost" size="icon" aria-label="Bookmark post" onClick={() => gooeyToast.info("Bookmarking is not available from the current API.")}><Bookmark className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
