import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckmarkBadge01Icon } from "@/lib/icons";
import type { Politician } from "@/types";

export function PoliticianCard({ politician }: { politician: Politician }) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/10 text-lg font-bold text-primary">
            {politician.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{politician.name}</h3>
              {politician.verified ? <AppIcon icon={CheckmarkBadge01Icon} size={18} className="text-primary" /> : null}
            </div>
            <p className="text-sm text-muted-foreground">{politician.position} · {politician.state}</p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary">{politician.party}</Badge>
              <Badge variant="outline">{politician.approvalScore}% approval</Badge>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span>Performance</span>
            <span className="font-semibold">{politician.performanceScore}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all" style={{ width: `${politician.performanceScore}%` }} />
          </div>
        </div>
        <Button className="mt-5 w-full" variant="outline" asChild>
          <Link href={`/politicians/${politician.id}`}>View scorecard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
