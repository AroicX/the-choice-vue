import { BarChart3, Flame, Newspaper, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueCard } from "@/components/cards/issue-card";
import { PoliticianCard } from "@/components/cards/politician-card";
import { PollCard } from "@/components/cards/poll-card";
import { PostCard } from "@/components/cards/post-card";
import { issues, politicians, polls, posts } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Civic dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-5xl">Welcome to the future of democracy in Nigeria.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Know your leaders. Track performance. Hold power accountable.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Explore civic feed</Button>
            <Button variant="outline">Report an issue</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Active issues", "8,432", Flame],
          ["Tracked leaders", "1,204", BarChart3],
          ["Mock votes", "92,810", Vote],
          ["Civic stories", "316", Newspaper]
        ].map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label as string}</p>
                <p className="mt-1 text-2xl font-bold">{value as string}</p>
              </div>
              <Icon className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily civic brief</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-accent p-4 text-accent-foreground">Lagos transport petition gained 1,200 new supporters today.</div>
          <div className="rounded-md bg-secondary p-4">Two active mock elections close this week.</div>
          <div className="rounded-md bg-secondary p-4">Budget transparency is the top governance topic this morning.</div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">See what is happening</h2>
          {posts.map((post) => <PostCard post={post} key={post.id} />)}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Trending issues</h2>
          {issues.slice(0, 2).map((issue) => <IssueCard issue={issue} key={issue.id} />)}
          <h2 className="pt-2 text-xl font-semibold">Active polls</h2>
          {polls.slice(0, 1).map((poll) => <PollCard poll={poll} key={poll.id} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Politician scorecard highlights</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {politicians.map((politician) => <PoliticianCard politician={politician} key={politician.id} />)}
        </div>
      </section>
    </div>
  );
}
