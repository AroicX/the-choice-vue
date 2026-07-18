"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePostCommentsStream } from "@/hooks/use-post-comments-stream";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { extractComments } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export const COMMENTS_PAGE_SIZE = 10;

export type CommentsPage = {
  comments: ApiRecord[];
  nextOffset?: number;
};

async function fetchPostCommentsPage(postId: string, skip: number): Promise<CommentsPage> {
  const response = await api.get(endpoints.comments.byPost(postId), {
    params: { skip, take: COMMENTS_PAGE_SIZE }
  });
  const comments = extractComments(response.data);
  return {
    comments,
    nextOffset: comments.length === COMMENTS_PAGE_SIZE ? skip + COMMENTS_PAGE_SIZE : undefined
  };
}

export function usePostComments(postId: string) {
  usePostCommentsStream(postId);

  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => fetchPostCommentsPage(postId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: Infinity,
    retry: false
  });
}

export function flattenComments(pages: CommentsPage[] | undefined) {
  return pages?.flatMap((page) => page.comments) ?? [];
}
