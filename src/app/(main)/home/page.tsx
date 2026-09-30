"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/cards/post-card";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader } from "@/components/timeline/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePost } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";

type FeedTab = "home" | "trending" | "following" | "local";

const TABS: Array<{ id: FeedTab; label: string; requiresAuth?: boolean }> = [
  { id: "home", label: "For you" },
  { id: "trending", label: "Trending" },
  { id: "following", label: "Following", requiresAuth: true },
  { id: "local", label: "Local", requiresAuth: true }
];

const EMPTY_COPY: Record<FeedTab, { title: string; body: string; href: string; action: string }> = {
  home: {
    title: "Nothing here yet",
    body: "Posts from civic discussions will show up here.",
    href: "/discourse",
    action: "Browse discussions"
  },
  trending: {
    title: "Nothing is trending",
    body: "Check back soon, or start a conversation in a discussion.",
    href: "/discourse",
    action: "Browse discussions"
  },
  following: {
    title: "Your following feed is empty",
    body: "Follow leaders and citizens to see their activity here.",
    href: "/politicians",
    action: "Find leaders to follow"
  },
  local: {
    title: "No local posts yet",
    body: "Add your state and LGA to your profile to see what’s happening near you.",
    href: "/settings",
    action: "Update your location"
  }
};

function BriefStat({
  href,
  value,
  label,
  isLoading
}: {
  href: string;
  value: number;
  label: string;
  isLoading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-0.5 p-4 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
    >
      {isLoading ? (
        <Skeleton className="h-7 w-10" />
      ) : (
        <span className="text-2xl font-extrabold leading-7 tracking-tight tabular-nums">{value.toLocaleString()}</span>
      )}
      <span className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
        <span
          className="translate-x-0 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
          aria-hidden
        >
          →
        </span>
      </span>
    </Link>
  );
}

export default function HomePage() {
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginModalStore((state) => state.open);
  const [selected, setSelected] = useState<FeedTab>("home");

  const tabs = TABS.filter((tab) => !tab.requiresAuth || isAuthenticated);
  // Falls back if the user signs out while on an auth-only tab.
  const active = tabs.some((tab) => tab.id === selected) ? selected : "home";

  const feedQuery = useQuery({
    queryKey: ["home", "feed", active, userId ?? null],
    queryFn: () => civicQueries.feed(active)
  });
  const issuesQuery = useQuery({ queryKey: ["shell", "issues"], queryFn: civicQueries.issues });
  const pollsQuery = useQuery({ queryKey: ["shell", "polls"], queryFn: civicQueries.polls });
  const politiciansQuery = useQuery({ queryKey: ["shell", "politicians"], queryFn: civicQueries.politicians });
  const newsQuery = useQuery({ queryKey: ["home", "news"], queryFn: civicQueries.news });
  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  const posts = asArray<ApiRecord>(feedQuery.data).map((record) => normalizePost(record, userId));
  const empty = EMPTY_COPY[active];

  return (
    <>
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl border p-5 sm:p-7">
          {/* Brand mark as a quiet watermark; decorative only. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192x192.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-8 size-48 rotate-[-8deg] opacity-[0.06] dark:opacity-[0.08]"
          />
          {/* The server renders in UTC, so the date may differ by a day from the viewer's. */}
          <p suppressHydrationWarning className="relative flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
            Civic pulse · {today}
          </p>
          <h1 className="relative mt-3 max-w-[460px] text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
            The future of democracy in <span className="text-primary">Nigeria.</span>
          </h1>
          <p className="relative mt-3 max-w-[440px] text-[15px] leading-5 text-muted-foreground">
            Know your leaders. Track their performance. Hold power to account.
          </p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {isAuthenticated ? (
              <>
                <Button asChild>
                  <Link href="/politicians">Rate a leader</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/issues/create">Report an issue</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="inverted">
                  <Link href="/register">Create account</Link>
                </Button>
                <Button variant="outline" onClick={() => openLoginModal("Sign in to continue.")}>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="brief-heading" className="px-4 pb-4 pt-5">
        <h2 id="brief-heading" className="mb-2 text-[15px] font-bold">
          Daily civic brief
        </h2>
        <div className="grid grid-cols-2 divide-border overflow-hidden rounded-2xl border sm:grid-cols-4 sm:divide-x [&>*:nth-child(-n+2)]:border-b sm:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-r-0">
          <BriefStat href="/issues" value={asArray(issuesQuery.data).length} label="Open issues" isLoading={issuesQuery.isLoading} />
          <BriefStat href="/polls" value={asArray(pollsQuery.data).length} label="Polls" isLoading={pollsQuery.isLoading} />
          <BriefStat
            href="/politicians"
            value={asArray(politiciansQuery.data).length}
            label="Leaders tracked"
            isLoading={politiciansQuery.isLoading}
          />
          <BriefStat href="/news" value={asArray(newsQuery.data).length} label="News stories" isLoading={newsQuery.isLoading} />
        </div>
      </section>

      <TimelineHeader tabs={tabs} active={active} onSelect={setSelected} className="border-t" />

      <div role="tabpanel" aria-busy={feedQuery.isLoading}>
        {feedQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <PostRowSkeleton key={index} />)
        ) : feedQuery.isError ? (
          <TimelineError onRetry={() => feedQuery.refetch()} />
        ) : posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} variant="timeline" />)
        ) : (
          <TimelineEmpty {...empty} />
        )}
      </div>
    </>
  );
}
