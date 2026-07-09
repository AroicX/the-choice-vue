"use client";

import { ReactionButton } from "@/components/animations/reaction-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/icon";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Bookmark02Icon, Comment01Icon, FavouriteIcon, Share08Icon, ThumbsDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCommentModalStore } from "@/stores/comment-modal-store";
import type { Post } from "@/types";
import { gooeyToast } from "goey-toast";
import Image from "next/image";
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
  const { likes, dislikes, react, isPending, isLiked, isDisliked } = usePostReaction(post);
  const profilePic = post.user?.profilePic;
  const commentCount = post._count?.comments ?? post.comments;

  async function sharePost(event: React.MouseEvent) {
    event.stopPropagation();
    const url = `${window.location.origin}/threads/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: post.topic, text: post.message, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    gooeyToast.success("Post link copied");
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
          <div className="flex items-start gap-3">
            {profilePic ?
              (<Image src={profilePic} alt={post.author} width={44} height={44} className="rounded-full" />) :
              (<div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 text-sm font-bold text-primary">
                {post.author.slice(0, 2).toUpperCase()}
              </div>)}
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.topic}</p>
            </div>
          </div>
          <PostBadge badge={post.badge ?? "default"} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-7 text-foreground">{post.message}</p>
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
