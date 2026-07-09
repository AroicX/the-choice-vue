"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueCard } from "@/components/cards/issue-card";
import { PoliticianCard } from "@/components/cards/politician-card";
import { PollCard } from "@/components/cards/poll-card";
import { PostCard } from "@/components/cards/post-card";
import {
  IssueCardSkeleton,
  PoliticianCardSkeleton,
  PollCardSkeleton,
  PostCardSkeleton,
  StatCardSkeleton
} from "@/components/skeletons/card-skeletons";
import { civicQueries } from "@/services/queries/civic.queries";
import { Analytics01Icon, FireIcon, News01Icon, CheckListIcon } from "@/lib/icons";
import { asArray, normalizeIssue, normalizePolitician, normalizePoll, normalizePost } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const userId = useAuthStore((state) => state.user?.id);
  const feedQuery = useQuery({ queryKey: ["home", "feed"], queryFn: () => civicQueries.feed("home") });
  const issuesQuery = useQuery({ queryKey: ["home", "issues"], queryFn: civicQueries.issues });
  const politiciansQuery = useQuery({ queryKey: ["home", "politicians"], queryFn: civicQueries.politicians });
  const pollsQuery = useQuery({ queryKey: ["home", "polls"], queryFn: civicQueries.polls });
  const newsQuery = useQuery({ queryKey: ["home", "news"], queryFn: civicQueries.news });


  const posts = asArray<ApiRecord>(feedQuery.data).map((record) => normalizePost(record, userId)).slice(0, 3);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);
  const politicians = asArray<ApiRecord>(politiciansQuery.data).map(normalizePolitician).slice(0, 3);
  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll).slice(0, 1);
  const news = asArray<ApiRecord>(newsQuery.data);

  return (
    <div className="space-y-8">
      <section className="hero-grid relative min-w-0 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card via-background to-accent/30 p-5 shadow-panel sm:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Civic dashboard</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="civic-gradient-text">The future of democracy in Nigeria.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Know your leaders. Track performance. Hold power accountable with live civic intelligence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto"><Link href="/feed">Explore civic feed</Link></Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild><Link href="/issues/create">Report an issue</Link></Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">Politician scorecard highlights</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {politiciansQuery.isLoading ? (
            <>
              <PoliticianCardSkeleton />
              <PoliticianCardSkeleton />
              <PoliticianCardSkeleton />
            </>
          ) : (
            politicians.map((politician) => <PoliticianCard politician={politician} key={politician.id} />)
          )}
        </div>
      </section>

      {/* <div className="grid gap-4 md:grid-cols-4">
        {issuesQuery.isLoading ? <StatCardSkeleton /> : (
          <Card className="glass-panel">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Active issues</p>
                <p className="mt-1 text-3xl font-bold">{issues.length.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500"><AppIcon icon={FireIcon} size={24} /></div>
            </CardContent>
          </Card>
        )}
        {politiciansQuery.isLoading ? <StatCardSkeleton /> : (
          <Card className="glass-panel">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Tracked leaders</p>
                <p className="mt-1 text-3xl font-bold">{asArray<ApiRecord>(politiciansQuery.data).length.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><AppIcon icon={Analytics01Icon} size={24} /></div>
            </CardContent>
          </Card>
        )}
        {pollsQuery.isLoading ? <StatCardSkeleton /> : (
          <Card className="glass-panel">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Active polls</p>
                <p className="mt-1 text-3xl font-bold">{asArray<ApiRecord>(pollsQuery.data).length.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-500"><AppIcon icon={CheckListIcon} size={24} /></div>
            </CardContent>
          </Card>
        )}
        {newsQuery.isLoading ? <StatCardSkeleton /> : (
          <Card className="glass-panel">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Civic stories</p>
                <p className="mt-1 text-3xl font-bold">{news.length.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600"><AppIcon icon={News01Icon} size={24} /></div>
            </CardContent>
          </Card>
        )}
      </div> */}

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Daily civic brief</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/issues" className="rounded-2xl bg-gradient-to-br from-primary/15 to-emerald-500/10 p-4 text-sm font-medium transition-transform hover:scale-[1.01]">
            There are {issues.length.toLocaleString()} citizen issues available to track.
          </Link>
          <Link href="/polls" className="rounded-2xl border border-primary/10 bg-background/70 p-4 text-sm font-medium transition-transform hover:scale-[1.01]">
            There are {asArray<ApiRecord>(pollsQuery.data).length.toLocaleString()} polls open or listed.
          </Link>
          <Link href="/news" className="rounded-2xl border border-primary/10 bg-background/70 p-4 text-sm font-medium transition-transform hover:scale-[1.01]">
            There are {news.length.toLocaleString()} civic news stories.
          </Link>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="section-title">See what is happening</h2>
          {feedQuery.isLoading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : (
            <>
              {posts.map((post) => <PostCard post={post} key={post.id} />)}
              {posts.length === 0 ? <p className="text-sm text-muted-foreground">No feed posts yet.</p> : null}
            </>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="section-title">Trending issues</h2>
          {issuesQuery.isLoading ? (
            <IssueCardSkeleton />
          ) : (
            issues.slice(0, 2).map((issue) => <IssueCard issue={issue} key={issue.id} />)
          )}
          <h2 className="section-title pt-2">Active polls</h2>
          {pollsQuery.isLoading ? (
            <PollCardSkeleton />
          ) : (
            polls.slice(0, 1).map((poll) => <PollCard poll={poll} key={poll.id} />)
          )}
        </div>
      </section>


    </div>
  );
}
