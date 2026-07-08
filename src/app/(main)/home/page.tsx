"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Flame, Newspaper, Vote } from "lucide-react";
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
import { asArray, normalizeIssue, normalizePolitician, normalizePoll, normalizePost } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function HomePage() {
  const feedQuery = useQuery({ queryKey: ["home", "feed"], queryFn: () => civicQueries.feed("home") });
  const issuesQuery = useQuery({ queryKey: ["home", "issues"], queryFn: civicQueries.issues });
  const politiciansQuery = useQuery({ queryKey: ["home", "politicians"], queryFn: civicQueries.politicians });
  const pollsQuery = useQuery({ queryKey: ["home", "polls"], queryFn: civicQueries.polls });
  const newsQuery = useQuery({ queryKey: ["home", "news"], queryFn: civicQueries.news });

  const posts = asArray<ApiRecord>(feedQuery.data).map(normalizePost).slice(0, 3);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);
  const politicians = asArray<ApiRecord>(politiciansQuery.data).map(normalizePolitician).slice(0, 3);
  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll).slice(0, 1);
  const news = asArray<ApiRecord>(newsQuery.data);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Civic dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-5xl">Welcome to the future of democracy in Nigeria.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Know your leaders. Track performance. Hold power accountable.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/feed">Explore civic feed</Link></Button>
            <Button variant="outline" asChild><Link href="/issues/create">Report an issue</Link></Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {issuesQuery.isLoading ? <StatCardSkeleton /> : (
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Active issues</p>
                <p className="mt-1 text-2xl font-bold">{issues.length.toLocaleString()}</p>
              </div>
              <Flame className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        )}
        {politiciansQuery.isLoading ? <StatCardSkeleton /> : (
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Tracked leaders</p>
                <p className="mt-1 text-2xl font-bold">{asArray<ApiRecord>(politiciansQuery.data).length.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        )}
        {pollsQuery.isLoading ? <StatCardSkeleton /> : (
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Active polls</p>
                <p className="mt-1 text-2xl font-bold">{asArray<ApiRecord>(pollsQuery.data).length.toLocaleString()}</p>
              </div>
              <Vote className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        )}
        {newsQuery.isLoading ? <StatCardSkeleton /> : (
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Civic stories</p>
                <p className="mt-1 text-2xl font-bold">{news.length.toLocaleString()}</p>
              </div>
              <Newspaper className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily civic brief</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/issues" className="rounded-md bg-accent p-4 text-accent-foreground">There are {issues.length.toLocaleString()} citizen issues available to track.</Link>
          <Link href="/polls" className="rounded-md bg-secondary p-4">There are {asArray<ApiRecord>(pollsQuery.data).length.toLocaleString()} polls open or listed.</Link>
          <Link href="/news" className="rounded-md bg-secondary p-4">There are {news.length.toLocaleString()} civic news stories.</Link>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">See what is happening</h2>
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
          <h2 className="text-xl font-semibold">Trending issues</h2>
          {issuesQuery.isLoading ? (
            <IssueCardSkeleton />
          ) : (
            issues.slice(0, 2).map((issue) => <IssueCard issue={issue} key={issue.id} />)
          )}
          <h2 className="pt-2 text-xl font-semibold">Active polls</h2>
          {pollsQuery.isLoading ? (
            <PollCardSkeleton />
          ) : (
            polls.slice(0, 1).map((poll) => <PollCard poll={poll} key={poll.id} />)
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Politician scorecard highlights</h2>
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
    </div>
  );
}
