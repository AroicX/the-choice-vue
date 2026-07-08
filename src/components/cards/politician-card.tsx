import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Politician } from "@/types";

export function PoliticianCard({ politician }: { politician: Politician }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
            {politician.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{politician.name}</h3>
              {politician.verified ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
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
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${politician.performanceScore}%` }} />
          </div>
        </div>
        <Button className="mt-5 w-full" variant="outline" asChild>
          <Link href={`/politicians/${politician.id}`}>View scorecard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
