"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FactCheckRow } from "@/components/cards/fact-check-row";
import { PostCard } from "@/components/cards/post-card";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizeFactCheck, normalizePost } from "@/lib/content-utils";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

type FeedTabId = "for-you" | "following" | "local" | "trending" | "fact-checks";

const ALL_TABS: Array<TimelineTab<FeedTabId> & { requiresAuth?: boolean }> = [
  { id: "for-you", label: "For you" },
  { id: "trending", label: "Trending" },
  { id: "fact-checks", label: "Fact checks" },
  { id: "following", label: "Following", requiresAuth: true },
  { id: "local", label: "Local", requiresAuth: true }
];

const FETCHERS: Record<FeedTabId, () => Promise<unknown>> = {
  "for-you": () => civicQueries.feed("home"),
  trending: () => civicQueries.feed("trending"),
  "fact-checks": civicQueries.factChecks,
  following: () => civicQueries.feed("following"),
  local: () => civicQueries.feed("local")
};

const EMPTY: Record<FeedTabId, { title: string; body: string; href: string; action: string }> = {
  "for-you": { title: "Nothing here yet", body: "Posts from civic discussions will show up here.", href: "/discourse", action: "Browse discussions" },
  trending: { title: "Nothing is trending", body: "Check back soon, or start a conversation.", href: "/discourse", action: "Browse discussions" },
  "fact-checks": { title: "No fact checks yet", body: "Verified claims about public figures will appear here.", href: "/fact-checks", action: "See all fact checks" },
  following: { title: "Your following feed is empty", body: "Follow leaders and citizens to see their activity here.", href: "/politicians", action: "Find leaders to follow" },
  local: { title: "No local posts yet", body: "Add your state and LGA to see what’s happening near you.", href: "/settings#location", action: "Update your location" }
};

// Links shared before this redesign used display names (?tab=Fact Checks).
const LEGACY_TAB: Record<string, FeedTabId> = {
  "For You": "for-you",
  Following: "following",
  Local: "local",
  Trending: "trending",
  "Fact Checks": "fact-checks"
};

export default function FeedPage() {
  return (
    <Suspense fallback={Array.from({ length: 5 }).map((_, index) => <PostRowSkeleton key={index} />)}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const tabs = ALL_TABS.filter((tab) => !tab.requiresAuth || isAuthenticated);
  const requested = searchParams.get("tab") ?? "";
  const requestedId = (LEGACY_TAB[requested] ?? requested) as FeedTabId;
  const active = tabs.some((tab) => tab.id === requestedId) ? requestedId : "for-you";

  const query = useQuery({
    queryKey: ["feed", active, userId ?? null],
    queryFn: FETCHERS[active]
  });
  const records = asArray<ApiRecord>(query.data);

  function select(id: FeedTabId) {
    // Replace, not push: switching tabs shouldn't fill the back stack.
    router.replace(id === "for-you" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
  }

  return (
    <>
      <TimelineHeader title="Civic feed" tabs={tabs} active={active} onSelect={select} />
      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <PostRowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what={active === "fact-checks" ? "fact checks" : "posts"} />
        ) : !records.length ? (
          <TimelineEmpty {...EMPTY[active]} />
        ) : active === "fact-checks" ? (
          records.map((record) => {
            const factCheck = normalizeFactCheck(record);
            return <FactCheckRow key={factCheck.id} factCheck={factCheck} />;
          })
        ) : (
          records.map((record) => {
            const post = normalizePost(record, userId);
            return <PostCard key={post.id} post={post} variant="timeline" />;
          })
        )}
      </div>
    </>
  );
}
