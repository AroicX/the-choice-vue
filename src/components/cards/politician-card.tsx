"use client";

import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckmarkBadge01Icon } from "@/lib/icons";
import type { Politician } from "@/types";

export function PoliticianCard({ politician }: { politician: Politician }) {
  const score = politician.performanceScore || politician.approvalScore;

  return (
    <Card className="overflow-hidden transition-colors">
      <CardContent className="space-y-4 p-5">
        {politician.imageUrl ? (
          <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={politician.imageUrl}
              alt={politician.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold leading-5">{politician.name}</h2>
            {politician.verified ? <AppIcon icon={CheckmarkBadge01Icon} size={18} className="shrink-0 text-primary" /> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {politician.position}
            {politician.party ? ` · ${politician.party}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {politician.state ? <Badge variant="secondary">{politician.state}</Badge> : null}
            {politician.constituency ? <Badge variant="outline">{politician.constituency}</Badge> : null}
            {politician.partyImage ? (
              <div className="relative h-5 w-5 overflow-hidden rounded-full bg-muted">
                <Image src={politician.partyImage} alt={politician.party} fill className="object-cover" sizes="20px" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold">{score || "—"}{score ? "%" : ""}</p>
            <p className="text-sm text-muted-foreground">Performance</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{politician.approvalScore || "—"}{politician.approvalScore ? "%" : ""}</p>
            <p className="text-xs text-muted-foreground">Approval</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Scorecard</span>
            <span className="font-semibold">{score}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
        </div>

        <Button className="w-full" variant="outline" asChild>
          <Link href={`/politicians/${politician.id}`}>View scorecard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
