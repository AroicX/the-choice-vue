"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { GenericCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, displayName, recordId } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";

export default function FactChecksPage() {
  const query = useQuery({
    queryKey: ["fact-checks"],
    queryFn: civicQueries.factChecks
  });
  const factChecks = asArray<ApiRecord>(query.data);

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
          <Link key={recordId(factCheck)} href={`/fact-checks/${recordId(factCheck)}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-5">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-semibold">{displayName(factCheck)}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{String(factCheck.explanation ?? factCheck.description ?? "")}</p>
              <Badge className="mt-4" variant="info">{String(factCheck.verdict ?? "UNVERIFIED")}</Badge>
            </CardContent>
          </Card>
          </Link>
        ))}
        </QueryListState>
      </div>
    </div>
  );
}
