"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message01Icon, Search01Icon } from "@/lib/icons";
import { AppIcon } from "@/components/ui/icon";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton, PollCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Input } from "@/components/ui/input";
import { PollCard } from "@/components/cards/poll-card";
import { civicQueries } from "@/services/queries/civic.queries";
import { userQueries } from "@/services/queries/user.queries";
import { asArray, displayName, isRoomMember, normalizePoll, recordId, stringifyJson } from "@/lib/content-utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";
import type { ApiRecord, RoomRecord } from "@/types";

function DiscourseRoomCard({ room, joined }: { room: ApiRecord; joined?: boolean }) {
  const roomId = recordId(room);
  const posts = Number(room.postCount ?? room.posts ?? 0);
  const members = Number(room.memberCount ?? room.members ?? 0);
  const title = displayName(room);
  const subtitle = String(room.question ?? room.description ?? room.topic ?? "Open civic discussion");

  return (
    <Link
      href={`/discussions/${roomId}`}
      className={cn(
        "group block rounded-2xl border p-4 transition-all duration-200",
        joined
          ? "border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm hover:border-primary/35 hover:shadow-glow"
          : "border-border/80 bg-card hover:border-primary/20 hover:bg-accent/30"
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            joined ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground"
          )}
        >
          <AppIcon icon={Message01Icon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-[15px] font-semibold text-foreground group-hover:text-primary">{title}</h2>
            {joined ? (
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Joined
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{subtitle}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{posts.toLocaleString()} posts</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{members.toLocaleString()} members</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RoomSection({
  title,
  description,
  rooms,
  joined,
  isLoading,
  emptyMessage
}: {
  title: string;
  description: string;
  rooms: ApiRecord[];
  joined?: boolean;
  isLoading: boolean;
  emptyMessage: string;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <QueryListState
          isLoading={isLoading}
          isEmpty={rooms.length === 0}
          count={joined ? 2 : 4}
          skeleton={<GenericCardSkeleton />}
          emptyMessage={emptyMessage}
        >
          {rooms.map((room) => (
            <DiscourseRoomCard key={recordId(room)} room={room} joined={joined} />
          ))}
        </QueryListState>
      </div>
    </section>
  );
}

export default function DiscoursePage() {
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useRequireAuth();
  const query = useQuery({
    queryKey: ["discussions"],
    queryFn: civicQueries.discussions
  });
  const pollsQuery = useQuery({
    queryKey: ["discourse", "polls"],
    queryFn: civicQueries.polls
  });
  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: isAuthenticated,
    retry: false
  });
  const memberships = asArray<RoomRecord>(roomsQuery.data);

  const { joinedRooms, discoverRooms } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = asArray<ApiRecord>(query.data).filter((room) => !term || stringifyJson(room).toLowerCase().includes(term));
    const joined: ApiRecord[] = [];
    const discover: ApiRecord[] = [];

    for (const room of all) {
      if (isRoomMember(memberships, recordId(room))) joined.push(room);
      else discover.push(room);
    }

    return { joinedRooms: joined, discoverRooms: discover };
  }, [memberships, query.data, search]);

  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll).slice(0, 4);
  const isLoading = query.isLoading || (isAuthenticated && roomsQuery.isLoading);

  return (
    <div>
      <PageHeader title="Discourse Forums" description="Join focused civic rooms around policy, places, elections, and public services." />
      <div className="relative mb-6">
        <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search discourse rooms" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {isAuthenticated ? (
        <RoomSection
          title="Your rooms"
          description="Discussions you’ve already joined."
          rooms={joinedRooms}
          joined
          isLoading={isLoading}
          emptyMessage={search ? "No joined rooms match your search." : "You haven’t joined any rooms yet."}
        />
      ) : null}

      <RoomSection
        title={isAuthenticated ? "Discover rooms" : "All rooms"}
        description={isAuthenticated ? "Browse other civic discussions and join the ones that matter to you." : "Browse civic discussions and join the ones that matter to you."}
        rooms={discoverRooms}
        isLoading={isLoading}
        emptyMessage={search ? "No rooms match your search." : "No discourse rooms yet."}
      />

      <h2 className="mb-4 text-lg font-semibold tracking-tight">Polls in discourse</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={pollsQuery.isLoading}
          isEmpty={polls.length === 0}
          count={2}
          skeleton={<PollCardSkeleton />}
          emptyMessage="No discourse polls available yet."
        >
          {polls.map((poll) => (
            <PollCard poll={poll} key={poll.id} />
          ))}
        </QueryListState>
      </div>
    </div>
  );
}
