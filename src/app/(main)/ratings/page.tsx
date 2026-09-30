"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RatingCard } from "@/components/cards/rating-card";
import { PageHeader } from "@/components/shared/page-header";
import { RatingCardSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { FilterSelect, SearchField, UnderlineTabs } from "@/components/ui/filters";
import {
  asArray,
  normalizeRatingCandidate,
  normalizeRatingOffice,
  ratingOfficeLabel
} from "@/lib/content-utils";
import { ratingsService } from "@/services/ratings.service";
import type { ApiRecord, RatingCandidate } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const OFFICE_TABS = [
  { id: "ALL", label: "All" },
  { id: "PRESIDENCY", label: "President" },
  { id: "SENATOR", label: "Senators" },
  { id: "GOVERNOR", label: "Governors" },
  { id: "HOUSE", label: "House of Reps" }
] as const;

type OfficeTab = (typeof OFFICE_TABS)[number]["id"];

const OFFICE_ORDER = ["PRESIDENCY", "SENATOR", "GOVERNOR", "HOUSE"] as const;

function groupByOffice(candidates: RatingCandidate[]) {
  const groups = new Map<string, RatingCandidate[]>();

  for (const candidate of candidates) {
    const key = normalizeRatingOffice(candidate.position);
    const list = groups.get(key) ?? [];
    list.push(candidate);
    groups.set(key, list);
  }

  const orderedKeys = [
    ...OFFICE_ORDER.filter((key) => groups.has(key)),
    ...[...groups.keys()].filter((key) => !OFFICE_ORDER.includes(key as (typeof OFFICE_ORDER)[number])).sort()
  ];

  return orderedKeys.map((key) => ({
    key,
    label: ratingOfficeLabel(key),
    items: (groups.get(key) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
  }));
}

export default function RatingsPage() {
  const viewerId = useAuthStore((state) => state.user?.id ?? "anon");
  const [office, setOffice] = useState<OfficeTab>("ALL");
  const [search, setSearch] = useState("");
  const [party, setParty] = useState("");
  const [state, setState] = useState("");

  // Scoped by viewer: the response carries per-user `hasRated`, so an unscoped
  // key would show one account's rated state to the next person on this browser.
  const query = useQuery({
    queryKey: ["ratings", "candidates", viewerId],
    // Every page: take=100 silently dropped candidates past the 100th (prod has 106).
    queryFn: () => ratingsService.listAll<ApiRecord>()
  });

  const candidates = useMemo(
    () => asArray<ApiRecord>(query.data).map(normalizeRatingCandidate),
    [query.data]
  );

  const parties = useMemo(
    () =>
      [...new Set(candidates.map((item) => item.party).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b)
      ),
    [candidates]
  );

  const states = useMemo(
    () =>
      [...new Set(candidates.map((item) => item.state).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b)
      ),
    [candidates]
  );

  const officeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: candidates.length };
    for (const candidate of candidates) {
      const key = normalizeRatingOffice(candidate.position);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [candidates]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const candidateOffice = normalizeRatingOffice(candidate.position);
      if (office !== "ALL" && candidateOffice !== office) return false;
      if (party && (candidate.party ?? "").toUpperCase() !== party.toUpperCase()) return false;
      if (state && (candidate.state ?? "").toLowerCase() !== state.toLowerCase()) return false;
      if (!term) return true;
      return [candidate.name, candidate.party, candidate.state, candidate.constituency, candidate.position]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [candidates, office, party, search, state]);

  const grouped = useMemo(() => groupByOffice(filtered), [filtered]);
  const hasActiveFilters = office !== "ALL" || Boolean(party || state || search.trim());

  function clearFilters() {
    setOffice("ALL");
    setSearch("");
    setParty("");
    setState("");
  }

  const grid = "grid gap-4 sm:grid-cols-2";

  return (
    <div>
      <PageHeader title="Ratings" description="Score leaders on the goals that matter to you. One rating per person, per candidate." />

      <UnderlineTabs
        label="Office"
        // Empty offices would be dead-end tabs; keep "All" and the active one.
        tabs={OFFICE_TABS.filter((tab) => tab.id === "ALL" || tab.id === office || officeCounts[tab.id]).map((tab) => ({
          id: tab.id,
          label: tab.label,
          count: officeCounts[tab.id] ?? 0
        }))}
        active={office}
        onSelect={setOffice}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField value={search} onChange={setSearch} placeholder="Search candidates" className="sm:max-w-sm sm:flex-1" />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Party" value={party} onChange={setParty} options={parties} allLabel="All parties" />
          <FilterSelect label="State" value={state} onChange={setState} options={states} allLabel="All states" />
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {query.isLoading ? (
          <div className={grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <RatingCardSkeleton key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="candidates" />
        ) : filtered.length === 0 ? (
          hasActiveFilters ? (
            <TimelineEmpty title="No matches" body="No candidates match these filters. Try widening your search." />
          ) : (
            <TimelineEmpty title="No candidates yet" body="Candidates will appear here once they’re added." />
          )
        ) : office === "ALL" ? (
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.key} aria-labelledby={`office-${group.key}`}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 id={`office-${group.key}`} className="text-xl font-bold tracking-tight">
                    {group.label}
                    <span className="ml-2 text-[15px] font-medium text-muted-foreground">{group.items.length}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOffice(group.key as OfficeTab)}
                    className="rounded text-[15px] text-primary hover:underline"
                  >
                    Show all
                  </button>
                </div>
                <div className={grid}>
                  {group.items.map((candidate) => (
                    <RatingCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className={grid}>
            {filtered
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((candidate) => (
                <RatingCard key={candidate.id} candidate={candidate} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
