"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PostActions } from "@/components/actions/post-actions";
import { PostCard } from "@/components/cards/post-card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { normalizePost } from "@/lib/content-utils";
import type { ApiRecord, Post } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

function useLivePost(slug: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getData<ApiRecord>(endpoints.posts.detail(slug)),
    retry: false
  });

  return {
    post: query.data ? normalizePost(query.data, userId) : null,
    isLoading: query.isLoading,
    error: query.error
  };
}

export function PostDetailView({ slug }: { slug: string }) {
  const { post, isLoading, error } = useLivePost(slug);

  return (
    <div className="space-y-5">
      <div>
        <Link href=".." className="text-sm font-medium text-primary">Back</Link>
        <h1 className="mt-3 text-2xl font-bold">Post thread</h1>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="p-5 text-destructive">{error.message}</CardContent>
        </Card>
      ) : post ? (
        <PostThread post={post} />
      ) : null}
    </div>
  );
}

function PostThread({ post }: { post: Post }) {
  return (
    <>
      <PostCard post={post} interactive={false} showActions={false} />
      <PostActions post={post} />
    </>
  );
}
