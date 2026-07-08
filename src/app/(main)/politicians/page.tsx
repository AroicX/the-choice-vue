"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticianCard } from "@/components/cards/politician-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { PoliticianCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Input } from "@/components/ui/input";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizePolitician, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function PoliticiansPage() {
  const [search, setSearch] = useState("");
  const [party, setParty] = useState("");
  const [state, setState] = useState("");
  const [office, setOffice] = useState("");
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

  return (
    <div>
      <PageHeader title="Politicians" description="Search leader profiles, scorecards, promises, ratings, and related public issues." />
      <div className="mb-5 grid gap-3 md:grid-cols-4">
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
    </div>
  );
}
