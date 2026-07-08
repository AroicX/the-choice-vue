"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareText, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { polls } from "@/lib/mock-data";
import { PollCard } from "@/components/cards/poll-card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function DiscoursePage() {
  const query = useQuery({
    queryKey: ["discussions"],
    queryFn: civicQueries.discussions
  });
  const discourseRooms = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Discourse Forums" description="Join focused civic rooms around policy, places, elections, and public services." />
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search discourse rooms" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {query.isLoading ? <p className="text-sm text-muted-foreground">Loading discourse rooms...</p> : null}
        {discourseRooms.map((room) => (
          <Card key={recordId(room)}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-accent text-accent-foreground">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{displayName(room)}</h2>
                      <p className="text-sm text-muted-foreground">{String(room.topic ?? "Discussion")} · {String(room.createdAt ?? "Recently active")}</p>
                    </div>
                    <Badge variant="secondary">Trending</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{Number(room.postCount ?? room.posts ?? 0).toLocaleString()} posts</span>
                    <span>{Number(room.memberCount ?? room.members ?? 0).toLocaleString()} members</span>
                  </div>
                  <Button className="mt-4" variant="outline" size="sm" asChild>
                    <Link href={`/discussions/${recordId(room)}`}>View room</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!query.isLoading && discourseRooms.length === 0 ? <p className="text-sm text-muted-foreground">No discourse rooms yet.</p> : null}
      </div>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Polls in discourse</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {polls.map((poll) => <PollCard poll={poll} key={poll.id} />)}
      </div>
    </div>
  );
}
