"use client";

import { useCallback, useEffect } from "react";
import { AppIcon } from "@/components/ui/icon";
import { PostCommentComposer } from "@/components/comments/post-comment-composer";
import { PostQuote } from "@/components/comments/post-quote";
import { CommentSkeleton } from "@/components/skeletons/card-skeletons";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { flattenComments, usePostComments } from "@/hooks/use-post-comments";
import { commentAuthor } from "@/lib/content-utils";
import { Comment01Icon } from "@/lib/icons";
import type { Post } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

type PostCommentSectionProps = {
  post: Post;
};

export function PostCommentSection({ post }: PostCommentSectionProps) {
  const commentsQuery = usePostComments(post.id);
  const comments = flattenComments(commentsQuery.data?.pages);

  const loadMore = useCallback(() => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

  const sentinelRef = useInfiniteScroll(loadMore, Boolean(commentsQuery.hasNextPage));

  useEffect(() => {
    if (window.location.hash !== "#comments") return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isInitialLoading = commentsQuery.isLoading;
  const isSyncing = commentsQuery.isFetching && !commentsQuery.isLoading && !commentsQuery.isFetchingNextPage;

  return (
    <Card id="comments" className="glass-panel scroll-mt-24">
      <CardContent className="space-y-5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Comments</h2> 
            <p className="mt-1 text-sm text-muted-foreground">
              {comments.length.toLocaleString()} loaded
              {commentsQuery.hasNextPage ? "+" : ""} {comments.length === 1 ? "reply" : "replies"} · updates live
            </p>
          </div>
          {isSyncing ? <span className="text-xs font-medium text-primary">Syncing...</span> : null}
        </div>

        {/* <PostQuote post={post} /> */}
        <PostCommentComposer post={post} showQuote={false} />

        <div className="space-y-3 border-t border-primary/10 pt-4">
          {isInitialLoading ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          ) : (
            <>
              {comments.map((comment) => {
                const isOptimistic = String(comment.id ?? "").startsWith("optimistic-");
                return (
                  <div
                    key={String(comment.id)}
                    className={`rounded-xl border bg-background/60 p-3 ${isOptimistic ? "border-primary/30 opacity-80" : "border-primary/10"
                      }`}
                  >
                    <p className="text-sm leading-6">{String(comment.message ?? comment.content ?? "")}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {commentAuthor(comment)}
                      {isOptimistic ? " · Sending..." : ""}
                    </p>
                  </div>
                );
              })}

              {commentsQuery.isFetchingNextPage ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : null}

              <div ref={sentinelRef} className="h-1" aria-hidden />

              {comments.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AppIcon icon={Comment01Icon} size={16} />
                  No comments yet. Start the conversation.
                </p>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
