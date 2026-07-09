"use client";

import { ReactionButton } from "@/components/animations/reaction-button";
import { PostCommentSection } from "@/components/comments/post-comment-section";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { FavouriteIcon, ThumbsDownIcon } from "@/lib/icons";
import type { Post } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";

export function PostActions({ post }: { post: Post }) {
  const { requireAuth } = useRequireAuth();
  const { likes, dislikes, react, isPending, isLiked, isDisliked } = usePostReaction(post);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
      </div>

      <PostCommentSection post={post} />
    </div>
  );
}
