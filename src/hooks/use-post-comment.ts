"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { useState } from "react";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { CommentsPage } from "@/hooks/use-post-comments";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

export function usePostComment(postId: string, options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState("");

  const commentMutation = useMutation({
    mutationFn: (body: string) => api.post(endpoints.comments.create(postId), { message: body }),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previous = queryClient.getQueryData<InfiniteData<CommentsPage>>(["comments", postId]);
      const optimistic: ApiRecord = {
        id: `optimistic-${Date.now()}`,
        message: body,
        postsId: postId,
        postId,
        user: user
          ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            }
          : undefined,
        createdAt: new Date().toISOString()
      };

      queryClient.setQueryData<InfiniteData<CommentsPage>>(["comments", postId], (current) => {
        if (!current?.pages.length) {
          return {
            pages: [{ comments: [optimistic], nextOffset: undefined }],
            pageParams: [0]
          };
        }

        const pages = current.pages.map((page, index) =>
          index === current.pages.length - 1 ? { ...page, comments: [...page.comments, optimistic] } : page
        );

        return { ...current, pages };
      });

      queryClient.setQueryData<ApiRecord>(["post", postId], (current) => {
        if (!current) return current;
        const nextCount = Number(current.comments ?? current.commentCount ?? 0) + 1;
        return { ...current, comments: nextCount, commentCount: nextCount };
      });

      const previousPost = queryClient.getQueryData<ApiRecord>(["post", postId]);
      return { previous, previousPost };
    },
    onError: (error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", postId], context.previous);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      gooeyToast.error("Comment failed", { description: error instanceof Error ? error.message : "Try again." });
    },
    onSuccess: () => {
      setMessage("");
      options?.onSuccess?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["home", "feed"] });
    }
  });

  function submitComment() {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (!requireAuth("Sign in to comment on this post.")) return;
    commentMutation.mutate(trimmed);
  }

  return {
    message,
    setMessage,
    submitComment,
    isPending: commentMutation.isPending,
    reset: () => setMessage("")
  };
}
