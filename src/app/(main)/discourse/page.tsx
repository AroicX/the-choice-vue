"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PollCard } from "@/components/cards/poll-card";
import { RoomCover } from "@/components/discourse/room-cover";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { civicQueries } from "@/services/queries/civic.queries";
import { userQueries } from "@/services/queries/user.queries";
import { asArray, isRoomMember, normalizePoll, recordId } from "@/lib/content-utils";
import { Search01Icon } from "@/lib/icons";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, RoomRecord } from "@/types";

type TabId = "rooms" | "joined" | "polls";

const ALL_TABS: Array<TimelineTab<TabId> & { requiresAuth?: boolean }> = [
  { id: "rooms", label: "Rooms" },
  { id: "joined", label: "Your rooms", requiresAuth: true },
  { id: "polls", label: "Polls" }
];

function plural(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

function RoomRow({ room, joined }: { room: ApiRecord; joined: boolean }) {
  const title = String(room.topic ?? room.title ?? "Untitled room");
  const question = String(room.question ?? room.description ?? "");
  const counts = (room._count ?? {}) as { rooms?: number; posts?: number; polls?: number };
  const members = Number(counts.rooms ?? 0);
  const posts = Number(counts.posts ?? 0);
  const polls = Number(counts.polls ?? 0);

  return (
    <Link
      href={`/discussions/${recordId(room)}`}
      className="flex gap-3 border-b px-4 py-3.5 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
    >
      <RoomCover seed={recordId(room)} src={room.coverImage ? String(room.coverImage) : null} className="h-14 w-20 shrink-0 rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="line-clamp-2 text-[15px] font-bold leading-5">{title}</span>
          {joined ? (
            <span className="mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[12px] font-semibold text-muted-foreground">
              Joined
            </span>
          ) : null}
        </span>
        {question && question !== title ? (
          <span className="mt-1 line-clamp-2 block text-[15px] leading-5 text-muted-foreground">{question}</span>
        ) : null}
        <span className="mt-2 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
          <span>{plural(members, "member")}</span>
          <span aria-hidden>·</span>
          <span>{plural(posts, "post")}</span>
          {polls ? (
            <>
              <span aria-hidden>·</span>
              <span>{plural(polls, "poll")}</span>
            </>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

function RoomRowSkeleton() {
  return (
    <div className="flex gap-3 border-b px-4 py-3.5" aria-hidden>
      <Skeleton className="h-14 w-20 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function DiscoursePage() {
  return (
    <Suspense fallback={Array.from({ length: 5 }).map((_, index) => <RoomRowSkeleton key={index} />)}>
      <DiscourseContent />
    </Suspense>
  );
}

function DiscourseContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [search, setSearch] = useState("");

  const tabs = ALL_TABS.filter((tab) => !tab.requiresAuth || isAuthenticated);
  const requested = searchParams.get("tab") as TabId | null;
  const active: TabId = tabs.some((tab) => tab.id === requested) ? (requested as TabId) : "rooms";

  const discussionsQuery = useQuery({ queryKey: ["discussions"], queryFn: civicQueries.discussions });
  const pollsQuery = useQuery({ queryKey: ["discourse", "polls"], queryFn: civicQueries.polls, enabled: active === "polls" });
  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: isAuthenticated,
    retry: false
  });
  const memberships = asArray<RoomRecord>(roomsQuery.data);

  const rooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return asArray<ApiRecord>(discussionsQuery.data)
      .map((room) => ({ room, joined: isRoomMember(memberships, recordId(room)) }))
      .filter(({ joined }) => active !== "joined" || joined)
      .filter(({ room }) => {
        if (!term) return true;
        const haystack = [room.topic, room.question, room.description].map((value) => String(value ?? "")).join(" ");
        return haystack.toLowerCase().includes(term);
      });
  }, [active, discussionsQuery.data, memberships, search]);

  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll);

  function select(id: TabId) {
    router.replace(id === "rooms" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
  }

  const roomsLoading = discussionsQuery.isLoading || (active === "joined" && roomsQuery.isLoading);

  return (
    <>
      <TimelineHeader title="Discourse" tabs={tabs} active={active} onSelect={select} />

      {active !== "polls" ? (
        <div className="border-b px-4 py-3">
          <div className="relative">
            <AppIcon
              icon={Search01Icon}
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rooms"
              aria-label="Search rooms"
              className="h-10 w-full rounded-[10px] border border-transparent bg-secondary pl-11 pr-4 text-[15px] placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      <div role="tabpanel">
        {active === "polls" ? (
          pollsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <RoomRowSkeleton key={index} />)
          ) : pollsQuery.isError ? (
            <TimelineError onRetry={() => pollsQuery.refetch()} what="polls" />
          ) : polls.length ? (
            <div className="space-y-3 p-4">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <TimelineEmpty title="No polls yet" body="Polls created inside discussion rooms will show up here." />
          )
        ) : roomsLoading ? (
          Array.from({ length: 6 }).map((_, index) => <RoomRowSkeleton key={index} />)
        ) : discussionsQuery.isError ? (
          <TimelineError onRetry={() => discussionsQuery.refetch()} what="rooms" />
        ) : rooms.length ? (
          rooms.map(({ room, joined }) => <RoomRow key={recordId(room)} room={room} joined={joined} />)
        ) : search ? (
          <TimelineEmpty title="No matches" body={`No rooms match “${search.trim()}”. Try a different word.`} />
        ) : active === "joined" ? (
          <TimelineEmpty
            title="You haven’t joined a room"
            body="Join a room to post, vote in its polls and follow the conversation."
            href="/discourse"
            action="Browse rooms"
          />
        ) : (
          <TimelineEmpty title="No rooms yet" body="Discussion rooms will appear here once they’re created." />
        )}
      </div>
    </>
  );
}
