"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizeFactCheck } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function FactChecksPage() {
  const query = useQuery({
    queryKey: ["fact-checks"],
    queryFn: civicQueries.factChecks
  });
  const factChecks = asArray<ApiRecord>(query.data).map(normalizeFactCheck);

  return (
    <div>
      <PageHeader title="Fact Checks" description="Claims, verdicts, sources, evidence, and civic context." />
      <div className="grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={factChecks.length === 0}
          count={4}
          skeleton={<GenericCardSkeleton />}
          emptyMessage="No fact checks available yet."
        >
          {factChecks.map((factCheck) => (
            <Link key={factCheck.id} href={`/fact-checks/${factCheck.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="p-5">
                  <Badge variant="info">{factCheck.verdict.replaceAll("_", " ")}</Badge>
                  <h2 className="mt-4 font-semibold leading-6">{factCheck.claim}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{factCheck.explanation}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {factCheck.sources.length} source{factCheck.sources.length === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </QueryListState>
      </div>
    </div>
  );
}
