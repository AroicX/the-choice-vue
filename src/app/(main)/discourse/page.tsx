"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message01Icon, Search01Icon } from "@/lib/icons";
import { AppIcon } from "@/components/ui/icon";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton, PollCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PollCard } from "@/components/cards/poll-card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, normalizePoll, recordId, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function DiscoursePage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["discussions"],
    queryFn: civicQueries.discussions
  });
  const pollsQuery = useQuery({
    queryKey: ["discourse", "polls"],
    queryFn: civicQueries.polls
  });
  const discourseRooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return asArray<ApiRecord>(query.data).filter((room) => !term || stringifyJson(room).toLowerCase().includes(term));
  }, [query.data, search]);
  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll).slice(0, 4);

  return (
    <div>
      <PageHeader title="Discourse Forums" description="Join focused civic rooms around policy, places, elections, and public services." />
      <div className="relative mb-5">
        <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search discourse rooms" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={discourseRooms.length === 0}
          count={4}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No discourse rooms yet."
        >
          {discourseRooms.map((room) => (
            <Card key={recordId(room)}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-accent text-accent-foreground">
                    <AppIcon icon={Message01Icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{displayName(room)}</h2>
                        <p className="text-sm text-muted-foreground">{String(room.topic ?? "Discussion")} </p>
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
        </QueryListState>
      </div>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Polls in discourse</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={pollsQuery.isLoading}
          isEmpty={polls.length === 0}
          count={2}
          skeleton={<PollCardSkeleton />}
          emptyMessage="No discourse polls available yet."
        >
          {polls.map((poll) => <PollCard poll={poll} key={poll.id} />)}
        </QueryListState>
      </div>
    </div>
  );
}
