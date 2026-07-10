"use client";

import { ReactionButton } from "@/components/animations/reaction-button";
import { MediaAttachmentGrid } from "@/components/media/media-attachment-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/icon";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { profilePath } from "@/lib/content-utils";
import { Bookmark02Icon, Comment01Icon, FavouriteIcon, Share08Icon, ThumbsDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCommentModalStore } from "@/stores/comment-modal-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { Post } from "@/types";
import { gooeyToast } from "goey-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostBadge } from "./post-badge";

type PostCardProps = {
  post: Post;
  interactive?: boolean;
  showActions?: boolean;
};

export function PostCard({ post, interactive = true, showActions = true }: PostCardProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const openCommentModal = useCommentModalStore((state) => state.open);
  const openShareModal = useShareModalStore((state) => state.open);
  const { likes, dislikes, react, isPending, isLiked, isDisliked } = usePostReaction(post);
  const profilePic = post.user?.profilePic;
  const commentCount = post._count?.comments ?? post.comments;
  const authorHref = profilePath(post.user, post.handle);

  function sharePost(event: React.MouseEvent) {
    event.stopPropagation();
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

  function openPost() {
    if (!interactive) return;
    router.push(`/threads/post/${post.id}`);
  }

  function stop(event: React.MouseEvent) {
    event.stopPropagation();
  }

  function openComments(event: React.MouseEvent) {
    stop(event);
    if (!requireAuth("Sign in to comment on this post.")) return;
    openCommentModal(post);
  }

  return (
    <Card
      className={cn("animate-fade-up overflow-visible", interactive && "cursor-pointer transition-transform hover:scale-[1.005]")}
      onClick={openPost}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Link href={authorHref} onClick={stop} className="shrink-0">
              {profilePic ? (
                <Image src={profilePic} alt={post.author} width={44} height={44} className="rounded-full object-cover" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 text-sm font-bold text-primary">
                  {post.author.slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="min-w-0">
              <Link href={authorHref} onClick={stop} className="block truncate font-semibold hover:underline">
                {post.author}
              </Link>
              <Link href={authorHref} onClick={stop} className="mt-0.5 block truncate text-sm text-muted-foreground hover:text-primary hover:underline">
                {post.handle}
              </Link>
              {post.topic ? <p className="mt-1 text-xs text-muted-foreground">{post.topic}</p> : null}
            </div>
          </div>
          <PostBadge badge={post.badge ?? "default"} />
        </div>
      </CardHeader>
      <CardContent>
        {post.attachments?.length ? <MediaAttachmentGrid items={post.attachments} /> : null}
        <p className="text-sm leading-5 text-foreground">{post.message}</p>
        {showActions ? (
          <div
            className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-3 text-sm text-muted-foreground"
            onClick={stop}
          >
            <ReactionButton
              type="like"
              icon={FavouriteIcon}
              count={likes}
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
              count={dislikes}
              label="Dislike post"
              active={isDisliked}
              disabled={isPending}
              onAction={() => {
                if (!requireAuth("Sign in to react to posts.")) return;
                react("dislike");
              }}
            />
            {interactive ? (
              <Button variant="ghost" size="sm" onClick={openComments}>
                <AppIcon icon={Comment01Icon} size={18} className="mr-2" />
                {commentCount}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                <AppIcon icon={Comment01Icon} size={18} className="mr-2" />
                {commentCount}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={sharePost}>
              <AppIcon icon={Share08Icon} size={18} className="mr-2" />
              {post.shares}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bookmark post"
              onClick={(event) => {
                stop(event);
                gooeyToast.info("Bookmarking is not available from the current API.");
              }}
            >
              <AppIcon icon={Bookmark02Icon} size={18} />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
