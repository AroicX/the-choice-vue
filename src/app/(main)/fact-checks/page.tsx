"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FactCheckRow } from "@/components/cards/fact-check-row";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { asArray, normalizeFactCheck } from "@/lib/content-utils";
import { factChecksService } from "@/services/civic-content.service";
import type { ApiRecord } from "@/types";

type TabId = "all" | "true" | "false" | "misleading" | "unverified";

const TABS: TimelineTab<TabId>[] = [
  { id: "all", label: "All" },
  { id: "true", label: "True" },
  { id: "false", label: "False" },
  { id: "misleading", label: "Misleading" },
  { id: "unverified", label: "Unverified" }
];

// Each tab covers its "mostly" neighbour, and Mixed sits with Misleading.
const MATCH: Record<Exclude<TabId, "all">, string[]> = {
  true: ["TRUE", "MOSTLY_TRUE"],
  false: ["FALSE", "MOSTLY_FALSE"],
  misleading: ["MISLEADING", "MIXED"],
  unverified: ["UNVERIFIED"]
};

export default function FactChecksPage() {
  const [tab, setTab] = useState<TabId>("all");
  const query = useQuery({ queryKey: ["fact-checks", "all"], queryFn: () => factChecksService.listAll<ApiRecord>() });
  const all = asArray<ApiRecord>(query.data).map(normalizeFactCheck);
  const visible = tab === "all" ? all : all.filter((item) => MATCH[tab].includes(item.verdict.toUpperCase()));

  return (
    <>
      <TimelineHeader title="Fact checks" tabs={TABS} active={tab} onSelect={setTab} />
      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <PostRowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="fact checks" />
        ) : visible.length ? (
          visible.map((factCheck) => <FactCheckRow key={factCheck.id} factCheck={factCheck} />)
        ) : (
          <TimelineEmpty
            title={tab === "all" ? "No fact checks yet" : "Nothing with this verdict"}
            body="Claims by and about public figures are checked and published here."
          />
        )}
      </div>
    </>
  );
}
