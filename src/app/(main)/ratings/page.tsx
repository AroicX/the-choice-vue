"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RatingCard } from "@/components/cards/rating-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  asArray,
  normalizeRatingCandidate,
  normalizeRatingOffice,
  ratingOfficeLabel
} from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { ApiRecord, RatingCandidate } from "@/types";

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
  const [office, setOffice] = useState<OfficeTab>("ALL");
  const [search, setSearch] = useState("");
  const [party, setParty] = useState("ALL");
  const [state, setState] = useState("ALL");

  const query = useQuery({
    queryKey: ["ratings", "candidates"],
    queryFn: () => getData<ApiRecord[]>(endpoints.ratings.list, { take: 100 })
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
      if (party !== "ALL" && (candidate.party ?? "").toUpperCase() !== party.toUpperCase()) return false;
      if (state !== "ALL" && (candidate.state ?? "").toLowerCase() !== state.toLowerCase()) return false;
      if (!term) return true;
      return [candidate.name, candidate.party, candidate.state, candidate.constituency, candidate.position]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [candidates, office, party, search, state]);

  const grouped = useMemo(() => groupByOffice(filtered), [filtered]);
  const hasActiveFilters = office !== "ALL" || party !== "ALL" || state !== "ALL" || Boolean(search.trim());

  function clearFilters() {
    setOffice("ALL");
    setSearch("");
    setParty("ALL");
    setState("ALL");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ratings Hub"
        description="Rate leaders by office — President, Senators, Governors, and House members."
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {OFFICE_TABS.map((tab) => {
          const active = office === tab.id;
          const count = officeCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOffice(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn("ml-2 tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, party, state..."
          aria-label="Search candidates"
        />
        <select
          value={party}
          onChange={(event) => setParty(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by party"
        >
          <option value="ALL">All parties</option>
          {parties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={state}
          onChange={(event) => setState(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by state"
        >
          <option value="ALL">All states</option>
          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          disabled={!hasActiveFilters}
          onClick={clearFilters}
          className="w-full"
        >
          Clear filters
        </Button>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <GenericCardSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <QueryListState
          isLoading={false}
          isEmpty
          count={0}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No candidates matched your search or filters."
        >
          {null}
        </QueryListState>
      ) : office === "ALL" ? (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.key} className="space-y-4">
              <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
                <div>
                  <h2 className="text-lg font-semibold">{group.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {group.items.length} candidate{group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setOffice(group.key as OfficeTab)}>
                  View only
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((candidate) => (
                  <RatingCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{ratingOfficeLabel(office)}</h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} candidate{filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((candidate) => (
                <RatingCard key={candidate.id} candidate={candidate} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
