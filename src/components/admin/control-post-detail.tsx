"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { AdminActionMenu, AdminConfirmDeleteModal } from "@/components/admin/admin-action-menu";
import { EditModal, EmptyState, LoadingSkeleton } from "@/components/admin/admin-ui";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { CommentSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { flattenComments, usePostComments } from "@/hooks/use-post-comments";
import { commentAuthor, commentAuthorProfilePic, normalizePost } from "@/lib/content-utils";
import { normalizeMediaAttachments } from "@/lib/media-utils";
import { commentsService } from "@/services/comments.service";
import { postsService } from "@/services/posts.service";
import type { ApiRecord } from "@/types";

function displayError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function ControlPostDetail({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState(false);
  const [editingComment, setEditingComment] = useState<ApiRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "post" | "comment"; id: string; label: string } | null>(null);

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

  const updatePostMutation = useMutation({
    mutationFn: (payload: Record<string, string | boolean>) => postsService.update(postId, { message: payload.message }),
    onSuccess: () => {
      gooeyToast.success("Post updated");
      setEditingPost(false);
      queryClient.invalidateQueries({ queryKey: ["control", "posts", "detail", postId] });
      queryClient.invalidateQueries({ queryKey: ["control", "posts"] });
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => commentsService.update(id, { message }),
    onSuccess: () => {
      gooeyToast.success("Comment updated");
      setEditingComment(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id, reason }: { type: "post" | "comment"; id: string; reason: string }) => {
      if (type === "post") return postsService.remove(id, reason);
      return commentsService.remove(id, reason);
    },
    onSuccess: (_data, variables) => {
      gooeyToast.success(variables.type === "post" ? "Post deleted" : "Comment deleted");
      setDeleteTarget(null);
      if (variables.type === "post") {
        queryClient.invalidateQueries({ queryKey: ["control", "posts"] });
        window.location.assign("/control/posts");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["control", "posts", "detail", postId] });
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/control/posts" className="text-sm font-medium text-primary hover:underline">
            ← Back to posts
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Post thread</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review the post on the left and moderate comments on the right.</p>
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
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{displayError(postQuery.error)}</div>
      ) : null}

      {post ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {post.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{post.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{post.badge ?? "Post"}</Badge>
                <AdminActionMenu
                  actions={["Edit", "Delete"]}
                  onAction={(action) => {
                    if (action === "Edit") setEditingPost(true);
                    if (action === "Delete") setDeleteTarget({ type: "post", id: post.id, label: "this post" });
                  }}
                />
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{post.message || "No post message available."}</p>
            {post.attachments?.length ? <MediaAttachmentGrid items={post.attachments} className="mt-4" /> : null}
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
              <span>{post.likes} likes</span>
              <span>{post.dislikes ?? 0} dislikes</span>
              <span>{post._count?.comments ?? post.comments} comments</span>
              {post.createdAt ? <span>{new Date(post.createdAt).toLocaleString()}</span> : null}
            </div>
          </article>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Comments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {comments.length.toLocaleString()} loaded
                  {commentsQuery.hasNextPage ? "+" : ""} · scroll for more
                </p>
              </div>
              {isSyncing ? <span className="text-xs font-medium text-primary">Syncing...</span> : null}
            </div>

            {commentsQuery.isError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{displayError(commentsQuery.error)}</div>
            ) : null}

            {isCommentsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {comments.map((comment) => {
                  const author = commentAuthor(comment);
                  const profilePic = commentAuthorProfilePic(comment);
                  const attachments = normalizeMediaAttachments(comment.attachments);

                  return (
                    <div key={String(comment.id)} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {profilePic ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profilePic} alt={author} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                              {author.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <p className="truncate text-sm font-semibold text-foreground">{author}</p>
                        </div>
                        <AdminActionMenu
                          actions={["Edit", "Delete"]}
                          onAction={(action) => {
                            if (action === "Edit") setEditingComment(comment);
                            if (action === "Delete") setDeleteTarget({ type: "comment", id: String(comment.id), label: "this comment" });
                          }}
                        />
                      </div>
                      {attachments.length ? <MediaAttachmentGrid items={attachments} className="mb-3" /> : null}
                      <p className="line-clamp-6 text-sm leading-6 text-muted-foreground">{String(comment.message ?? comment.content ?? "")}</p>
                    </div>
                  );
                })}

                {commentsQuery.isFetchingNextPage ? (
                  <>
                    <CommentSkeleton />
                    <CommentSkeleton />
                  </>
                ) : null}

                <div ref={sentinelRef} className="col-span-full h-2" aria-hidden />

                {!comments.length ? <div className="col-span-full"><EmptyState title="No comments yet" description="This post has no comments to review." /></div> : null}

                {commentsQuery.hasNextPage ? (
                  <div className="col-span-full flex justify-center pt-2">
                    <Button variant="outline" className="rounded-lg" disabled={commentsQuery.isFetchingNextPage} onClick={() => commentsQuery.fetchNextPage()}>
                      {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more comments"}
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <EditModal
        open={editingPost}
        title="Edit post"
        fields={[{ name: "message", label: "Content", type: "textarea" }]}
        initialValues={{ message: post?.message ?? "" }}
        onClose={() => setEditingPost(false)}
        onSubmit={(payload) => updatePostMutation.mutate(payload)}
      />

      <EditModal
        open={Boolean(editingComment)}
        title="Edit comment"
        fields={[{ name: "message", label: "Comment", type: "textarea" }]}
        initialValues={{ message: String(editingComment?.message ?? editingComment?.content ?? "") }}
        onClose={() => setEditingComment(null)}
        onSubmit={(payload) => {
          if (!editingComment) return;
          updateCommentMutation.mutate({ id: String(editingComment.id), message: String(payload.message) });
        }}
      />

      <AdminConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.label ?? "content"}?`}
        message="The content owner will be notified that this was removed for a Terms of Service violation."
        onClose={() => setDeleteTarget(null)}
        onConfirm={(reason) => {
          if (!deleteTarget) return;
          deleteMutation.mutate({ ...deleteTarget, reason });
        }}
      />
    </div>
  );
}
