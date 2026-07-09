"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserReaction } from "@/types";

type PostReactionState = {
  reactions: Record<string, UserReaction>;
  getReaction: (userId: string | undefined, postId: string) => UserReaction | null;
  setReaction: (userId: string | undefined, postId: string, reaction: UserReaction | null) => void;
};

function reactionKey(userId: string, postId: string) {
  return `${userId}:${postId}`;
}

export const usePostReactionStore = create<PostReactionState>()(
  persist(
    (set, get) => ({
      reactions: {},
      getReaction: (userId, postId) => {
        if (!userId) return null;
        return get().reactions[reactionKey(userId, postId)] ?? null;
      },
      setReaction: (userId, postId, reaction) => {
        if (!userId) return;
        const key = reactionKey(userId, postId);
        set((state) => {
          const next = { ...state.reactions };
          if (!reaction) {
            delete next[key];
          } else {
            next[key] = reaction;
          }
          return { reactions: next };
        });
      }
    }),
    { name: "choice9ja-post-reactions" }
  )
);
