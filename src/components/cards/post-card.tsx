"use client";

import { ReactionButton } from "@/components/animations/reaction-button";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { AppIcon } from "@/components/ui/icon";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatRelativeTime, profilePath } from "@/lib/content-utils";
import { AiMagicIcon, Bookmark02Icon, Comment01Icon, FavouriteIcon, Message01Icon, Share08Icon, ThumbsDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCommentModalStore } from "@/stores/comment-modal-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { Post } from "@/types";
import type { IconSvgElement } from "@hugeicons/react";
import { gooeyToast } from "goey-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PostCardProps = {
  post: Post;
  interactive?: boolean;
  showActions?: boolean;
  /**
   * "timeline": edge-to-edge row separated by a hairline, for feeds.
   * "card": the same row inside a rounded border, for pages that stack posts
   * between other content.
   */
  variant?: "timeline" | "card";
  /**
   * Extra check before like/dislike/comment, after sign-in; return false to
   * block. Discussion rooms use it to require membership. Sharing is never gated.
   */
  guard?: () => boolean;
  /** AI summary shown under the post body. */
  summary?: string | null;
  /** Drop the "in <topic>" context line, e.g. inside that topic's own room. */
  hideTopic?: boolean;
};

const ACTION_TONE = {
  primary: "group-hover:text-primary",
  sky: "group-hover:text-sky-500"
} as const;

const ACTION_BG = {
  primary: "group-hover:bg-primary/10",
  sky: "group-hover:bg-sky-500/10"
} as const;

/** Icon-in-a-circle action, matching ReactionButton so the bar reads as one set. */
function PostAction({
  icon,
  label,
  count,
  tone,
  disabled,
  onClick
}: {
  icon: IconSvgElement;
  label: string;
  count?: number;
  tone: keyof typeof ACTION_TONE;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group inline-flex items-center rounded-full text-[13px] text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <span
        className={cn(
          "flex size-[34px] items-center justify-center rounded-full transition-colors",
          ACTION_BG[tone],
          ACTION_TONE[tone]
        )}
      >
        <AppIcon icon={icon} size={18} />
      </span>
      {count !== undefined ? (
        <span className={cn("min-w-[1ch] pr-2 tabular-nums transition-colors", ACTION_TONE[tone])}>
          {count > 0 ? count.toLocaleString() : ""}
        </span>
      ) : null}
    </button>
  );
}

export function PostCard({
  post,
  interactive = true,
  showActions = true,
  variant = "card",
  guard,
  summary,
  hideTopic = false
}: PostCardProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const openCommentModal = useCommentModalStore((state) => state.open);
  const openShareModal = useShareModalStore((state) => state.open);
  const { likes, dislikes, react, isPending, isLiked, isDisliked } = usePostReaction(post);
  const profilePic = post.user?.profilePic;
  const commentCount = post._count?.comments ?? post.comments;
  const authorHref = profilePath(post.user, post.handle);
  const postHref = `/threads/post/${post.id}`;
  const handle = post.handle.startsWith("@") ? post.handle : `@${post.handle}`;
  const relativeTime = formatRelativeTime(post.createdAt);

  function stop(event: React.MouseEvent) {
    event.stopPropagation();
  }

  function sharePost(event: React.MouseEvent) {
    stop(event);
    openShareModal({
      type: "post",
      url: `${window.location.origin}${postHref}`,
      author: post.author,
      handle: post.handle,
      authorAvatar: post.user?.profilePic,
      message: post.message,
      topic: post.topic,
      attachments: post.attachments
    });
  }

  function openComments(event: React.MouseEvent) {
    stop(event);
    if (!requireAuth("Sign in to comment on this post.")) return;
    if (guard && !guard()) return;
    openCommentModal(post);
  }

  // Mouse users can click anywhere on the row; keyboard users open the post
  // through the timestamp link, as on X. Ignore clicks that end a text selection.
  function openPost() {
    if (!interactive) return;
    if (window.getSelection()?.toString()) return;
    router.push(postHref);
  }

  return (
    <article
      onClick={openPost}
      className={cn(
        "flex gap-3 px-4 py-3",
        variant === "timeline" ? "border-b" : "rounded-2xl border",
        interactive && "cursor-pointer transition-colors hover:bg-foreground/[0.03]"
      )}
    >
      <Link href={authorHref} onClick={stop} className="shrink-0 self-start rounded-full" aria-label={`${post.author}'s profile`}>
        {profilePic ? (
          <Image src={profilePic} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
            {post.author.slice(0, 1).toUpperCase()}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {post.topic && !hideTopic ? (
          <p className="mb-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            <AppIcon icon={Message01Icon} size={14} />
            <span className="truncate">{post.topic}</span>
          </p>
        ) : null}

        <div className="flex min-w-0 items-baseline gap-1 text-[15px] leading-5">
          <Link href={authorHref} onClick={stop} className="truncate font-bold hover:underline">
            {post.author}
          </Link>
          <Link href={authorHref} onClick={stop} className="min-w-0 shrink truncate text-muted-foreground">
            {handle}
          </Link>
          {relativeTime ? (
            <>
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <Link href={postHref} onClick={stop} className="shrink-0 text-muted-foreground hover:underline">
                <time dateTime={post.createdAt} title={post.createdAt ? new Date(post.createdAt).toLocaleString() : undefined}>
                  {relativeTime}
                </time>
              </Link>
            </>
          ) : null}
        </div>

        {post.message.trim() ? (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-5">{post.message}</p>
        ) : null}

        {summary ? (
          <div className="mt-2 rounded-xl bg-secondary px-3 py-2">
            <p className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
              <AppIcon icon={AiMagicIcon} size={13} />
              AI summary
            </p>
            <p className="mt-0.5 text-[14px] leading-5">{summary}</p>
          </div>
        ) : null}

        {post.attachments?.length ? (
          <div onClick={stop}>
            <MediaAttachmentGrid items={post.attachments} className="rounded-2xl border" />
          </div>
        ) : null}

        {showActions ? (
          <div className="-ml-2 mt-1 flex max-w-[425px] items-center justify-between" onClick={stop}>
            <PostAction
              icon={Comment01Icon}
              label={`Comment, ${commentCount} comments`}
              count={commentCount}
              tone="primary"
              disabled={!interactive}
              onClick={openComments}
            />
            <ReactionButton
              type="like"
              icon={FavouriteIcon}
              count={likes}
              label="Like post"
              active={isLiked}
              disabled={isPending}
              onAction={() => {
                if (!requireAuth("Sign in to react to posts.")) return;
                if (guard && !guard()) return;
                react("like");
              }}
            />
            <ReactionButton
              type="dislike"
              icon={ThumbsDownIcon}
              count={dislikes}
              label="Dislike post"
              active={isDisliked}
              disabled={isPending}
              onAction={() => {
                if (!requireAuth("Sign in to react to posts.")) return;
                if (guard && !guard()) return;
                react("dislike");
              }}
            />
            <PostAction icon={Share08Icon} label="Share post" count={post.shares} tone="sky" onClick={sharePost} />
            <PostAction
              icon={Bookmark02Icon}
              label="Bookmark post"
              tone="sky"
              onClick={(event) => {
                stop(event);
                gooeyToast.info("Bookmarks are coming soon.");
              }}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
