"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { PostAction } from "@/components/cards/post-card";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { flattenComments, usePostComments } from "@/hooks/use-post-comments";
import { commentAuthor, commentAuthorProfilePic, formatRelativeTime, profilePath } from "@/lib/content-utils";
import { normalizeMediaAttachments } from "@/lib/media-utils";
import { Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord, Post } from "@/types";

function commentUser(comment: ApiRecord) {
  const user = (comment.user ?? comment.createdBy) as ApiRecord | undefined;
  if (!user || typeof user !== "object") return undefined;
  return {
    id: user.id ? String(user.id) : undefined,
    username: user.username ? String(user.username) : undefined
  };
}

function ReplySkeleton() {
  return (
    <div className="flex gap-3 border-b px-4 py-3" aria-hidden>
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Replies to a post as timeline rows, newest updates streamed in live, more
 * loaded on scroll. The reply box lives above this, on the post page.
 */
export function PostCommentSection({ post }: { post: Post }) {
  const openShareModal = useShareModalStore((state) => state.open);
  const commentsQuery = usePostComments(post.id);
  const comments = flattenComments(commentsQuery.data?.pages);
  const handle = post.handle.startsWith("@") ? post.handle : `@${post.handle}`;

  const loadMore = useCallback(() => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);
  const sentinelRef = useInfiniteScroll(loadMore, Boolean(commentsQuery.hasNextPage));

  function shareComment(comment: ApiRecord) {
    const author = commentAuthor(comment);
    const user = commentUser(comment);
    openShareModal({
      type: "comment",
      url: `${window.location.origin}/threads/post/${post.id}#comments`,
      author,
      handle: user?.username ? `@${user.username}` : undefined,
      authorAvatar: commentAuthorProfilePic(comment),
      message: String(comment.message ?? comment.content ?? ""),
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

  if (commentsQuery.isLoading) {
    return (
      <div id="comments" aria-busy>
        {Array.from({ length: 3 }).map((_, index) => (
          <ReplySkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <section id="comments" aria-label="Replies" className="scroll-mt-28">
      {comments.map((comment) => {
        const id = String(comment.id ?? "");
        const isOptimistic = id.startsWith("optimistic-");
        const author = commentAuthor(comment);
        const avatar = commentAuthorProfilePic(comment);
        const user = commentUser(comment);
        const href = profilePath(user, author);
        const attachments = normalizeMediaAttachments(comment.attachments);
        const time = formatRelativeTime(comment.createdAt);
        const text = String(comment.message ?? comment.content ?? "");

        return (
          <article key={id} className={cn("flex gap-3 border-b px-4 py-3", isOptimistic && "opacity-60")}>
            <Link href={href} className="shrink-0 self-start rounded-full" aria-label={`${author}'s profile`}>
              {avatar ? (
                <Image src={avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
                  {author.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-baseline gap-1 text-[15px] leading-5">
                <Link href={href} className="truncate font-bold hover:underline">
                  {author}
                </Link>
                {user?.username ? <span className="truncate text-muted-foreground">@{user.username}</span> : null}
                {isOptimistic ? (
                  <span className="shrink-0 text-muted-foreground">· Sending…</span>
                ) : time ? (
                  <span className="shrink-0 text-muted-foreground">
                    · <time dateTime={String(comment.createdAt)}>{time}</time>
                  </span>
                ) : null}
              </div>
              <p className="text-[13px] text-muted-foreground">
                Replying to <span className="text-primary">{handle}</span>
              </p>
              {text.trim() ? <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-5">{text}</p> : null}
              {attachments.length ? <MediaAttachmentGrid items={attachments} className="rounded-2xl border" /> : null}
              {!isOptimistic ? (
                <div className="-ml-2 mt-1 flex">
                  <PostAction icon={Share08Icon} label="Share reply" tone="sky" onClick={() => shareComment(comment)} />
                </div>
              ) : null}
            </div>
          </article>
        );
      })}

      {commentsQuery.isFetchingNextPage ? <ReplySkeleton /> : null}
      <div ref={sentinelRef} className="h-1" aria-hidden />

      {comments.length === 0 ? (
        <div className="px-8 py-12 text-center">
          <p className="text-[17px] font-bold">No replies yet</p>
          <p className="mt-1 text-[15px] text-muted-foreground">Be the first to add your voice.</p>
        </div>
      ) : null}
    </section>
  );
}
