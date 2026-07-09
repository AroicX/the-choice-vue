"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { normalizeFactCheck } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { factChecksService } from "@/services/civic-content.service";
import type { ApiRecord } from "@/types";

function verdictVariant(verdict: string): "default" | "secondary" | "warning" | "info" {
  const value = verdict.toUpperCase();
  if (value.includes("TRUE") && !value.includes("FALSE")) return "default";
  if (value.includes("FALSE") || value.includes("MISLEADING")) return "warning";
  return "secondary";
}

export function FactCheckDetailView({ factCheckId }: { factCheckId: string }) {
  const query = useQuery({
    queryKey: ["fact-check", factCheckId],
    queryFn: () => factChecksService.detail<ApiRecord>(factCheckId),
    retry: false
  });

  const factCheck = query.data ? normalizeFactCheck(query.data) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/fact-checks" className="text-sm font-medium text-primary hover:underline">
        ← Back to fact checks
      </Link>

      {query.isLoading ? <DetailSkeleton /> : null}
      {query.isError ? (
        <Card>
          <CardContent className="p-5 text-destructive">
            {query.error instanceof Error ? query.error.message : "Could not load fact check."}
          </CardContent>
        </Card>
      ) : null}

      {factCheck ? (
        <>
          <div>
            <Badge variant={verdictVariant(factCheck.verdict)} className={cn("mb-3")}>
              {factCheck.verdict.replaceAll("_", " ")}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight leading-snug">{factCheck.claim}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {factCheck.updatedAt
                ? `Updated ${new Date(factCheck.updatedAt).toLocaleDateString()}`
                : factCheck.createdAt
                  ? `Published ${new Date(factCheck.createdAt).toLocaleDateString()}`
                  : "Fact check"}
            </p>
          </div>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold">Explanation</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {factCheck.explanation || "No explanation provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold">Sources</h2>
              {factCheck.sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sources attached.</p>
              ) : (
                <ul className="space-y-2">
                  {factCheck.sources.map((source) => (
                    <li key={source}>
                      <a href={source} target="_blank" rel="noreferrer" className="break-all text-sm text-primary hover:underline">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {factCheck.relatedPoliticianIds.length ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Related politicians</h2>
                <div className="flex flex-wrap gap-2">
                  {factCheck.relatedPoliticianIds.map((id) => (
                    <ButtonLink key={id} href={`/politicians/${id}`} label="View politician" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent">
      {label}
    </Link>
  );
}
