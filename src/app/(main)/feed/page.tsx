"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/cards/post-card";
import { PageHeader } from "@/components/shared/page-header";
import { TabList } from "@/components/ui/tabs";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePost } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function FeedPage() {
  const query = useQuery({
    queryKey: ["feed", "home"],
    queryFn: () => civicQueries.feed("home")
  });
  const posts = asArray<ApiRecord>(query.data).map(normalizePost);

  return (
    <div>
      <PageHeader title="Civic Feed" description="Posts, civic updates, public performance notes, and community signals." />
      <TabList tabs={["For You", "Following", "Local", "Trending", "Fact Checks"]} />
      <div className="mt-5 space-y-4">
        {query.isLoading ? <p className="text-sm text-muted-foreground">Loading civic feed...</p> : null}
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
        {!query.isLoading && posts.length === 0 ? <p className="text-sm text-muted-foreground">No feed posts yet.</p> : null}
      </div>
    </div>
  );
}
