"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PoliticianCard } from "@/components/cards/politician-card";
import { PoliticiansCompareModal } from "@/components/politicians/politicians-compare-modal";
import { PageHeader } from "@/components/shared/page-header";
import { PoliticianCardSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { FilterSelect, SearchField, UnderlineTabs } from "@/components/ui/filters";
import { AppIcon } from "@/components/ui/icon";
import { JusticeScaleIcon } from "@/lib/icons";
import { asArray, normalizePolitician, normalizeRatingOffice } from "@/lib/content-utils";
import { politiciansService } from "@/services/politicians.service";
import type { ApiRecord } from "@/types";

type Office = "ALL" | "PRESIDENCY" | "GOVERNOR" | "SENATOR" | "HOUSE";

const OFFICES: Array<{ id: Office; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "PRESIDENCY", label: "President" },
  { id: "GOVERNOR", label: "Governors" },
  { id: "SENATOR", label: "Senators" },
  { id: "HOUSE", label: "House of Reps" }
];

const unique = (values: Array<string | undefined>) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));

function PoliticiansContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  const [office, setOffice] = useState<Office>("ALL");
  const [party, setParty] = useState("");
  const [state, setState] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  // Every page: a single list call stopped at the API's default of 20.
  const query = useQuery({
    queryKey: ["politicians", "all"],
    queryFn: () => politiciansService.listAll<ApiRecord>()
  });

  const all = useMemo(() => asArray<ApiRecord>(query.data).map(normalizePolitician), [query.data]);
  const parties = useMemo(() => unique(all.map((item) => item.party)), [all]);
  const states = useMemo(() => unique(all.map((item) => item.state)), [all]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: all.length };
    for (const item of all) {
      const key = normalizeRatingOffice(item.position);
      result[key] = (result[key] ?? 0) + 1;
    }
    return result;
  }, [all]);

  const politicians = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((item) => {
      if (office !== "ALL" && normalizeRatingOffice(item.position) !== office) return false;
      if (party && item.party !== party) return false;
      if (state && item.state !== state) return false;
      if (!term) return true;
      return [item.name, item.party, item.state, item.constituency].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [all, office, party, search, state]);

  const filtered = Boolean(search.trim() || party || state || office !== "ALL");

  return (
    <div>
      <PageHeader
        title="Politicians"
        description="Profiles, scorecards and public approval for Nigeria’s elected leaders."
        action={
          <Button variant="outline" onClick={() => setCompareOpen(true)}>
            <AppIcon icon={JusticeScaleIcon} size={18} />
            Compare
          </Button>
        }
      />

      <UnderlineTabs
        label="Office"
        // Empty offices would be dead-end tabs; keep "All" and the active one.
        tabs={OFFICES.filter((item) => item.id === "ALL" || item.id === office || counts[item.id]).map((item) => ({
          ...item,
          count: counts[item.id] ?? 0
        }))}
        active={office}
        onSelect={setOffice}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField value={search} onChange={setSearch} placeholder="Search by name or place" className="sm:max-w-sm sm:flex-1" />
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Party" value={party} onChange={setParty} options={parties} allLabel="All parties" />
          <FilterSelect label="State" value={state} onChange={setState} options={states} allLabel="All states" />
        </div>
      </div>

      <div className="mt-6">
        {query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <PoliticianCardSkeleton key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="politicians" />
        ) : politicians.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {politicians.map((politician) => (
              <PoliticianCard politician={politician} key={politician.id} />
            ))}
          </div>
        ) : filtered ? (
          <TimelineEmpty title="No matches" body="No leaders match these filters. Try widening your search." />
        ) : (
          <TimelineEmpty title="No politicians yet" body="Leader profiles will appear here once they’re added." />
        )}
      </div>

      <PoliticiansCompareModal open={compareOpen} onClose={() => setCompareOpen(false)} politicians={all} />
    </div>
  );
}

export default function PoliticiansPage() {
  return (
    <Suspense fallback={<PoliticianCardSkeleton />}>
      <PoliticiansContent />
    </Suspense>
  );
}
