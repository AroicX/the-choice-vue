"use client";

import { useEffect } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { extractComments } from "@/lib/content-utils";
import { endpoints } from "@/services/client/endpoints";
import { COMMENTS_PAGE_SIZE, type CommentsPage } from "@/hooks/use-post-comments";
import type { ApiRecord } from "@/types";

type CommentStreamEvent = {
  postId: string;
  type: "snapshot" | "created" | "updated" | "deleted";
  comments?: unknown;
  comment?: ApiRecord;
  commentId?: string;
};

function commentsStreamUrl(postId: string) {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ?? "https://thechoice9ja-api-production.up.railway.app/api"
  ).replace(/\/$/, "");
  return `${base}${endpoints.comments.stream(postId)}`;
}

function upsertComment(pages: CommentsPage[], comment: ApiRecord): CommentsPage[] {
  const commentId = String(comment.id ?? "");
  let found = false;

  const nextPages = pages.map((page) => ({
    ...page,
    comments: page.comments.map((existing) => {
      if (String(existing.id ?? "") === commentId) {
        found = true;
        return comment;
      }
      return existing;
    })
  }));

  if (found) return nextPages;

  if (!nextPages.length) {
    return [{ comments: [comment], nextOffset: undefined }];
  }

  const lastIndex = nextPages.length - 1;
  const lastPage = nextPages[lastIndex];
  const withoutOptimistic = lastPage.comments.filter(
    (existing) => !String(existing.id ?? "").startsWith("optimistic-")
  );

  nextPages[lastIndex] = {
    ...lastPage,
    comments: [...withoutOptimistic, comment]
  };

  return nextPages;
}

function removeComment(pages: CommentsPage[], commentId: string): CommentsPage[] {
  return pages.map((page) => ({
    ...page,
    comments: page.comments.filter((comment) => String(comment.id ?? "") !== commentId)
  }));
}

export function usePostCommentsStream(postId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId || typeof window === "undefined") return;

    const source = new EventSource(commentsStreamUrl(postId));

    source.onmessage = (event) => {
      let payload: CommentStreamEvent;
      try {
        payload = JSON.parse(event.data) as CommentStreamEvent;
      } catch {
        return;
      }

      if (payload.postId !== postId) return;

      queryClient.setQueryData<InfiniteData<CommentsPage>>(["comments", postId], (current) => {
        const pages = current?.pages ?? [];
        const pageParams = current?.pageParams ?? [0];

        if (payload.type === "snapshot") {
          if (pages.length > 0) return current;
          const comments = extractComments(payload.comments);
          const firstPage = comments.slice(0, COMMENTS_PAGE_SIZE);
          return {
            pages: [
              {
                comments: firstPage,
                nextOffset: comments.length > COMMENTS_PAGE_SIZE ? COMMENTS_PAGE_SIZE : undefined
              }
            ],
            pageParams
          };
        }

        if (payload.type === "created" && payload.comment) {
          return { pages: upsertComment(pages, payload.comment), pageParams };
        }

        if (payload.type === "updated" && payload.comment) {
          return { pages: upsertComment(pages, payload.comment), pageParams };
        }

        if (payload.type === "deleted" && payload.commentId) {
          return { pages: removeComment(pages, payload.commentId), pageParams };
        }

        return current;
      });
    };

    return () => source.close();
  }, [postId, queryClient]);
}
