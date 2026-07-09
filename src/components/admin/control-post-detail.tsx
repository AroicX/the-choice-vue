"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingSkeleton } from "@/components/admin/admin-ui";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { CommentSkeleton } from "@/components/skeletons/card-skeletons";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { flattenComments, usePostComments } from "@/hooks/use-post-comments";
import { commentAuthor, commentAuthorProfilePic, normalizePost } from "@/lib/content-utils";
import { normalizeMediaAttachments } from "@/lib/media-utils";
import { postsService } from "@/services/posts.service";
import type { ApiRecord } from "@/types";

function displayError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function ControlPostDetail({ postId }: { postId: string }) {
  const postQuery = useQuery({
    queryKey: ["control", "posts", "detail", postId],
    queryFn: () => postsService.detail<ApiRecord>(postId),
    retry: false
  });

  const commentsQuery = usePostComments(postId);
  const comments = flattenComments(commentsQuery.data?.pages);

  const loadMore = useCallback(() => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

  const sentinelRef = useInfiniteScroll(loadMore, Boolean(commentsQuery.hasNextPage));

  const post = postQuery.data ? normalizePost(postQuery.data) : null;
  const isCommentsLoading = commentsQuery.isLoading;
  const isSyncing = commentsQuery.isFetching && !commentsQuery.isLoading && !commentsQuery.isFetchingNextPage;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/control/posts" className="text-sm font-medium text-primary hover:underline">
            ← Back to posts
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Post thread</h2>
          <p className="mt-1 text-sm text-slate-500">Review the post and all comments with infinite scroll.</p>
        </div>
        {post ? (
          <Button asChild variant="outline" className="rounded-lg">
            <Link href={`/threads/post/${post.id}`} target="_blank" rel="noreferrer">
              Open public view
            </Link>
          </Button>
        ) : null}
      </div>

      {postQuery.isLoading ? <LoadingSkeleton /> : null}
      {postQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {displayError(postQuery.error)}
        </div>
      ) : null}

      {post ? (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                {post.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-950">{post.author}</p>
                <p className="text-sm text-slate-500">{post.topic}</p>
              </div>
            </div>
            <Badge variant="secondary">{post.badge ?? "Post"}</Badge>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">{post.message || "No post message available."}</p>
          {post.attachments?.length ? <MediaAttachmentGrid items={post.attachments} className="mt-4" /> : null}
          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            <span>{post.likes} likes</span>
            <span>{post.dislikes ?? 0} dislikes</span>
            <span>{post._count?.comments ?? post.comments} comments</span>
            {post.createdAt ? <span>{new Date(post.createdAt).toLocaleString()}</span> : null}
          </div>
        </article>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Comments</h3>
            <p className="mt-1 text-sm text-slate-500">
              {comments.length.toLocaleString()} loaded
              {commentsQuery.hasNextPage ? "+" : ""} · scroll for more
            </p>
          </div>
          {isSyncing ? <span className="text-xs font-medium text-primary">Syncing...</span> : null}
        </div>

        {commentsQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {displayError(commentsQuery.error)}
          </div>
        ) : null}

        {isCommentsLoading ? (
          <div className="space-y-3">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const author = commentAuthor(comment);
              const profilePic = commentAuthorProfilePic(comment);
              const attachments = normalizeMediaAttachments(comment.attachments);

              return (
                <div key={String(comment.id)} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    {profilePic ? (
                      <img src={profilePic} alt={author} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                        {author.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-slate-900">{author}</p>
                  </div>
                  {attachments.length ? <MediaAttachmentGrid items={attachments} className="mb-3" /> : null}
                  <p className="text-sm leading-6 text-slate-700">{String(comment.message ?? comment.content ?? "")}</p>
                </div>
              );
            })}

            {commentsQuery.isFetchingNextPage ? (
              <>
                <CommentSkeleton />
                <CommentSkeleton />
              </>
            ) : null}

            <div ref={sentinelRef} className="h-2" aria-hidden />

            {!comments.length ? (
              <EmptyState title="No comments yet" description="This post has no comments to review." />
            ) : null}

            {commentsQuery.hasNextPage ? (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  disabled={commentsQuery.isFetchingNextPage}
                  onClick={() => commentsQuery.fetchNextPage()}
                >
                  {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more comments"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
