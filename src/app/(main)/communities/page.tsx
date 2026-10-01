"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RoomCover } from "@/components/discourse/room-cover";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { SearchField } from "@/components/ui/filters";
import { asArray, normalizeCommunity } from "@/lib/content-utils";
import { communitiesService } from "@/services/civic-content.service";
import type { ApiRecord, Community } from "@/types";

type TabId = "all" | "STATE" | "LOCAL" | "TOPIC" | "POLITICAL_PARTY" | "CIVIL_SOCIETY";

const TABS: TimelineTab<TabId>[] = [
  { id: "all", label: "All" },
  { id: "STATE", label: "States" },
  { id: "LOCAL", label: "Local" },
  { id: "TOPIC", label: "Topics" },
  { id: "POLITICAL_PARTY", label: "Parties" },
  { id: "CIVIL_SOCIETY", label: "Groups" }
];

// LGA, ward and constituency communities all count as "Local".
const LOCAL_TYPES = ["LGA", "WARD", "CONSTITUENCY"];
const tabOf = (community: Community): TabId => (LOCAL_TYPES.includes(community.type) ? "LOCAL" : (community.type as TabId));

function CommunityRow({ community }: { community: Community }) {
  const place = [community.lga, community.state].filter(Boolean).join(", ");
  return (
    <Link
      href={`/communities/${community.id}`}
      className="flex gap-3 border-b px-4 py-3 transition-colors hover:bg-foreground/[0.02] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
    >
      <RoomCover seed={community.id} text={`${community.name} ${community.description}`} className="h-12 w-16 shrink-0 rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{community.name}</span>
        {community.description ? (
          <span className="line-clamp-2 block text-[14px] leading-5 text-muted-foreground">{community.description}</span>
        ) : null}
        {place && place !== community.name ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{place}</span> : null}
      </span>
    </Link>
  );
}

export default function CommunitiesPage() {
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["communities", "all"], queryFn: () => communitiesService.listAll<ApiRecord>() });
  const all = useMemo(() => asArray<ApiRecord>(query.data).map(normalizeCommunity), [query.data]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: all.length };
    for (const community of all) result[tabOf(community)] = (result[tabOf(community)] ?? 0) + 1;
    return result;
  }, [all]);

  const term = search.trim().toLowerCase();
  const visible = all.filter(
    (community) =>
      (tab === "all" || tabOf(community) === tab) &&
      (!term || [community.name, community.description, community.state, community.lga].join(" ").toLowerCase().includes(term))
  );

  return (
    <>
      <TimelineHeader
        title="Communities"
        // Empty types would be dead-end tabs.
        tabs={TABS.filter((item) => item.id === "all" || item.id === tab || counts[item.id])}
        active={tab}
        onSelect={setTab}
      />
      <div className="border-b px-4 py-3">
        <SearchField value={search} onChange={setSearch} placeholder="Search communities" />
      </div>
      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <PostRowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="communities" />
        ) : visible.length ? (
          visible.map((community) => <CommunityRow key={community.id} community={community} />)
        ) : (
          <TimelineEmpty title={term ? "No matches" : "No communities here yet"} body={term ? `Nothing matches “${search.trim()}”.` : "Communities will appear here once they’re created."} />
        )}
      </div>
    </>
  );
}
