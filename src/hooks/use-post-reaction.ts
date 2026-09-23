"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { usePostReactionStore } from "@/stores/post-reaction-store";
import type { Post, UserReaction } from "@/types";

function resolveInitialReaction(post: Post, userId?: string) {
  const stored = usePostReactionStore.getState().getReaction(userId, post.id);
  return stored ?? post.userReaction ?? null;
}

export function usePostReaction(post: Post) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const setStoredReaction = usePostReactionStore((state) => state.setReaction);
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes ?? 0);
  const [userReaction, setUserReaction] = useState<UserReaction | null>(() => resolveInitialReaction(post, userId));

  useEffect(() => {
    setLikes(post.likes);
    setDislikes(post.dislikes ?? 0);
    setUserReaction(resolveInitialReaction(post, userId));
  }, [post.dislikes, post.id, post.likes, post.userReaction, userId]);

  const mutation = useMutation({
    mutationFn: (type: UserReaction) =>
      api.patch(type === "like" ? endpoints.posts.like(post.id) : endpoints.posts.dislike(post.id)),
    onMutate: async (type) => {
      const snapshot = { likes, dislikes, userReaction };
      let nextLikes = likes;
      let nextDislikes = dislikes;
      // Clicking the active reaction withdraws it, so the next state is "none".
      const nextReaction: UserReaction | null = userReaction === type ? null : type;

      if (type === "like") {
        if (userReaction === "like") {
          nextLikes = Math.max(0, likes - 1);
        } else {
          nextLikes = likes + 1;
          if (userReaction === "dislike") nextDislikes = Math.max(0, dislikes - 1);
        }
      } else {
        if (userReaction === "dislike") {
          nextDislikes = Math.max(0, dislikes - 1);
        } else {
          nextDislikes = dislikes + 1;
          if (userReaction === "like") nextLikes = Math.max(0, likes - 1);
        }
      }

      setLikes(nextLikes);
      setDislikes(nextDislikes);
      setUserReaction(nextReaction);
      setStoredReaction(userId, post.id, nextReaction);

      return snapshot;
    },
    onError: (_error, _type, snapshot) => {
      if (!snapshot) return;
      setLikes(snapshot.likes);
      setDislikes(snapshot.dislikes);
      setUserReaction(snapshot.userReaction);
      setStoredReaction(userId, post.id, snapshot.userReaction);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["home", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      queryClient.invalidateQueries({ queryKey: ["detail"] });
    }
  });

  function react(type: UserReaction) {
    // Re-clicking the active reaction is allowed: it toggles it off.
    if (mutation.isPending) return;
    mutation.mutate(type);
  }

  return {
    likes,
    dislikes,
    userReaction,
    react,
    isPending: mutation.isPending,
    isLiked: userReaction === "like",
    isDisliked: userReaction === "dislike"
  };
}
