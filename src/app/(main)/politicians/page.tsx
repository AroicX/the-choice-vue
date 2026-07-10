"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PoliticianCard } from "@/components/cards/politician-card";
import { PoliticiansCompareModal } from "@/components/politicians/politicians-compare-modal";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { PoliticianCardSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { JusticeScaleIcon } from "@/lib/icons";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePolitician, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

function PoliticiansContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  const [party, setParty] = useState("");
  const [state, setState] = useState("");
  const [office, setOffice] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const query = useQuery({
    queryKey: ["politicians"],
    queryFn: civicQueries.politicians
  });

  const politicians = useMemo(() => {
    const terms = [search, party, state, office].map((term) => term.trim().toLowerCase()).filter(Boolean);
    return asArray<ApiRecord>(query.data)
      .filter((record) => terms.every((term) => stringifyJson(record).toLowerCase().includes(term)))
      .map(normalizePolitician);
  }, [office, party, query.data, search, state]);

  const allPoliticians = useMemo(
    () => asArray<ApiRecord>(query.data).map(normalizePolitician),
    [query.data]
  );

  return (
    <div>
      <PageHeader
        title="Politicians"
        description="Search leader profiles, scorecards, promises, ratings, and related public issues."
      />

      <button
        type="button"
        onClick={() => setCompareOpen(true)}
        className="mb-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-emerald-500/10 px-5 py-5 text-left shadow-sm transition hover:border-primary/35 hover:from-primary/15"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Side by side</p>
          <p className="mt-1 text-lg font-semibold sm:text-xl">Compare candidates</p>
          <p className="mt-1 text-sm text-muted-foreground">Pick two leaders, review scorecards, then share the result.</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <AppIcon icon={JusticeScaleIcon} size={22} />
        </span>
      </button>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Input placeholder="Party" value={party} onChange={(event) => setParty(event.target.value)} />
        <Input placeholder="State" value={state} onChange={(event) => setState(event.target.value)} />
        <Input placeholder="Office level" value={office} onChange={(event) => setOffice(event.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={politicians.length === 0}
          count={6}
          skeleton={<PoliticianCardSkeleton />}
          emptyMessage="No politicians matched your filters."
        >
          {politicians.map((politician) => (
            <PoliticianCard politician={politician} key={politician.id} />
          ))}
        </QueryListState>
      </div>

      <PoliticiansCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        politicians={allPoliticians}
      />
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
