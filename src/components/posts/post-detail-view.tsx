"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { ReactionButton } from "@/components/animations/reaction-button";
import { PostAction } from "@/components/cards/post-card";
import { PostCommentComposer } from "@/components/comments/post-comment-composer";
import { PostCommentSection } from "@/components/comments/post-comment-section";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { normalizePost, profilePath } from "@/lib/content-utils";
import { ArrowLeft01Icon, Bookmark02Icon, Comment01Icon, FavouriteIcon, Share08Icon, ThumbsDownIcon } from "@/lib/icons";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord, Post } from "@/types";

/** "3:42 PM · 25 Aug 2026", as X shows under a focused post. */
function fullTimestamp(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${time} · ${day}`;
}

function BackBar() {
  const router = useRouter();
  return (
    <div className="sticky top-[53px] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
      <button
        type="button"
        // History back when we came from inside the app; otherwise the feed.
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/home"))}
        aria-label="Back"
        className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
      >
        <AppIcon icon={ArrowLeft01Icon} size={20} />
      </button>
      <h1 className="text-xl font-bold tracking-tight">Post</h1>
    </div>
  );
}

function FocusedPost({ post, onReply }: { post: Post; onReply: () => void }) {
  const { requireAuth } = useRequireAuth();
  const openShareModal = useShareModalStore((state) => state.open);
  const { likes, dislikes, react, isPending, isLiked, isDisliked } = usePostReaction(post);
  const authorHref = profilePath(post.user, post.handle);
  const handle = post.handle.startsWith("@") ? post.handle : `@${post.handle}`;
  const comments = post._count?.comments ?? post.comments;
  const stamp = fullTimestamp(post.createdAt);

  function share() {
    openShareModal({
      type: "post",
      url: `${window.location.origin}/threads/post/${post.id}`,
      author: post.author,
      handle: post.handle,
      authorAvatar: post.user?.profilePic,
      message: post.message,
      topic: post.topic,
      attachments: post.attachments
    });
  }

  const stats = [
    { value: comments, label: comments === 1 ? "Reply" : "Replies" },
    { value: likes, label: likes === 1 ? "Like" : "Likes" },
    { value: dislikes, label: dislikes === 1 ? "Dislike" : "Dislikes" },
    { value: post.shares, label: post.shares === 1 ? "Share" : "Shares" }
  ].filter((stat) => stat.value > 0);

  return (
    <article className="px-4 pt-3">
      <div className="flex items-center gap-3">
        <Link href={authorHref} className="shrink-0 rounded-full" aria-label={`${post.author}'s profile`}>
          {post.user?.profilePic ? (
            <Image src={post.user.profilePic} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
              {post.author.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
        <div className="min-w-0 leading-5">
          <Link href={authorHref} className="block truncate text-[15px] font-bold hover:underline">
            {post.author}
          </Link>
          <Link href={authorHref} className="block truncate text-[15px] text-muted-foreground">
            {handle}
          </Link>
        </div>
      </div>

      {post.message.trim() ? (
        <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-6">{post.message}</p>
      ) : null}
      {post.attachments?.length ? <MediaAttachmentGrid items={post.attachments} className="rounded-2xl border" /> : null}

      {post.topic || stamp ? (
        <p className="mt-4 text-[15px] text-muted-foreground">
          {stamp ? <time dateTime={post.createdAt}>{stamp}</time> : null}
          {post.topic ? (
            <>
              {stamp ? " · " : ""}
              {post.discussionId ? (
                <Link href={`/discussions/${post.discussionId}`} className="hover:underline">
                  {post.topic}
                </Link>
              ) : (
                post.topic
              )}
            </>
          ) : null}
        </p>
      ) : null}

      {stats.length ? (
        <p className="mt-4 flex flex-wrap gap-x-5 border-t py-3 text-[15px] text-muted-foreground">
          {stats.map((stat) => (
            <span key={stat.label}>
              <strong className="font-bold text-foreground">{stat.value.toLocaleString()}</strong> {stat.label}
            </span>
          ))}
        </p>
      ) : null}

      <div className="flex items-center justify-around border-y py-1">
        <PostAction icon={Comment01Icon} label="Reply" tone="primary" onClick={onReply} />
        <ReactionButton
          type="like"
          icon={FavouriteIcon}
          count={0}
          label="Like post"
          active={isLiked}
          disabled={isPending}
          onAction={() => {
            if (!requireAuth("Sign in to react to posts.")) return;
            react("like");
          }}
        />
        <ReactionButton
          type="dislike"
          icon={ThumbsDownIcon}
          count={0}
          label="Dislike post"
          active={isDisliked}
          disabled={isPending}
          onAction={() => {
            if (!requireAuth("Sign in to react to posts.")) return;
            react("dislike");
          }}
        />
        <PostAction icon={Share08Icon} label="Share post" tone="sky" onClick={share} />
        <PostAction
          icon={Bookmark02Icon}
          label="Bookmark post"
          tone="sky"
          onClick={() => gooeyToast.info("Bookmarks are coming soon.")}
        />
      </div>
    </article>
  );
}

export function PostDetailView({ slug }: { slug: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  // Bumped to focus the reply box: on arrival via ?reply and on each Reply tap.
  const [focusSignal, setFocusSignal] = useState(0);

  const query = useQuery({
    queryKey: ["post", slug, userId ?? null],
    queryFn: () => getData<ApiRecord>(endpoints.posts.detail(slug)),
    retry: false
  });
  const post = query.data ? normalizePost(query.data, userId) : null;

  // Arriving from a Reply/comment button (?reply=1): focus the reply box.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("reply")) setFocusSignal(1);
  }, []);

  function focusComposer() {
    setFocusSignal((value) => value + 1);
  }

  return (
    <>
      <BackBar />
      {query.isLoading ? (
        <div className="space-y-3 px-4 pt-3" aria-busy>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      ) : query.isError || !post ? (
        <TimelineEmpty title="Post not found" body="It may have been deleted, or the link is wrong." href="/home" action="Back to home" />
      ) : (
        <>
          <FocusedPost post={post} onReply={focusComposer} />
          <PostCommentComposer post={post} focusSignal={focusSignal} />
          <PostCommentSection post={post} />
        </>
      )}
    </>
  );
}
