"use client";

import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { PostCommentComposer } from "@/components/comments/post-comment-composer";
import { CommentSkeleton } from "@/components/skeletons/card-skeletons";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { flattenComments, usePostComments } from "@/hooks/use-post-comments";
import { commentAuthor, commentAuthorProfilePic, profilePath } from "@/lib/content-utils";
import { normalizeMediaAttachments } from "@/lib/media-utils";
import { Comment01Icon, Share08Icon } from "@/lib/icons";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord, Post } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type PostCommentSectionProps = {
  post: Post;
};

export function PostCommentSection({ post }: PostCommentSectionProps) {
  const openShareModal = useShareModalStore((state) => state.open);
  const commentsQuery = usePostComments(post.id);
  const comments = flattenComments(commentsQuery.data?.pages);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

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
  const activeComment = comments.find((comment) => String(comment.id) === activeCommentId) ?? null;

  function shareComment(comment: ApiRecord) {
    const message = String(comment.message ?? comment.content ?? "");
    const author = commentAuthor(comment);
    openShareModal({
      type: "comment",
      url: `${window.location.origin}/threads/post/${post.id}#comments`,
      author,
      handle: `@${author.replace(/\s+/g, "").toLowerCase()}`,
      authorAvatar: commentAuthorProfilePic(comment),
      message,
      topic: post.topic,
      attachments: normalizeMediaAttachments(comment.attachments),
      quotedPost: {
        author: post.author,
        handle: post.handle,
        topic: post.topic,
        message: post.message,
        attachments: post.attachments
      }
    });
  }

  return (
    <Card id="comments" className="glass-panel scroll-mt-24">
      <CardContent className="space-y-5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Comments</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {comments.length.toLocaleString()} loaded
              {commentsQuery.hasNextPage ? "+" : ""} {comments.length === 1 ? "reply" : "replies"} · live updates
            </p>
          </div>
          {commentsQuery.isFetchingNextPage ? (
            <span className="text-xs font-medium text-muted-foreground">Loading more...</span>
          ) : null}
        </div>

        <PostCommentComposer post={post} showQuote={false} />

        {activeComment ? (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Comment thread</p>
                <p className="text-xs text-muted-foreground">{commentAuthor(activeComment)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveCommentId(null)}>
                Close
              </Button>
            </div>
            <p className="text-sm leading-6">{String(activeComment.message ?? activeComment.content ?? "")}</p>
            <MediaAttachmentGrid items={normalizeMediaAttachments(activeComment.attachments)} />
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Original post</p>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{post.message}</p>
              {post.attachments?.length ? <MediaAttachmentGrid items={post.attachments} className="mt-3" /> : null}
            </div>
          </div>
        ) : null}

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
                const attachments = normalizeMediaAttachments(comment.attachments);
                const isActive = String(comment.id) === activeCommentId;
                const author = commentAuthor(comment);
                const profilePic = commentAuthorProfilePic(comment);

                return (
                  <div
                    key={String(comment.id)}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isOptimistic) return;
                      setActiveCommentId(String(comment.id));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (!isOptimistic) setActiveCommentId(String(comment.id));
                      }
                    }}
                    className={cn(
                      "rounded-xl border bg-background/60 p-3 text-left transition-colors",
                      isOptimistic ? "border-primary/30 opacity-80" : "border-primary/10 hover:border-primary/25 hover:bg-accent/30",
                      isActive && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Link
                        href={profilePath(
                          (() => {
                            const user = (comment.user ?? comment.createdBy) as ApiRecord | undefined;
                            if (!user || typeof user !== "object") return undefined;
                            return {
                              id: user.id ? String(user.id) : undefined,
                              username: user.username ? String(user.username) : undefined
                            };
                          })(),
                          author
                        )}
                        onClick={(event) => event.stopPropagation()}
                        className="flex min-w-0 items-center gap-2 hover:opacity-90"
                      >
                        {profilePic ? (
                          <Image src={profilePic} alt={author} width={24} height={24} className="rounded-full object-cover" />
                        ) : (
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                            {author.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <p className="truncate text-sm font-semibold hover:underline">{author}</p>
                      </Link>
                    </div>
                    {attachments.length ? (
                      <div onClick={(event) => event.stopPropagation()}>
                        <MediaAttachmentGrid items={attachments} />
                      </div>
                    ) : null}
                    <p className="text-sm leading-6">{String(comment.message ?? comment.content ?? "")}</p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      {/* <p className="text-xs text-muted-foreground">
                        {commentAuthor(comment)}
                        {isOptimistic ? " · Sending..." : ""}
                      </p> */}
                      {!isOptimistic ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={(event) => {
                            event.stopPropagation();
                            shareComment(comment);
                          }}
                        >
                          <AppIcon icon={Share08Icon} size={14} className="mr-1.5" />
                          Share
                        </Button>
                      ) : null}
                    </div>
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
