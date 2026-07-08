import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function FactChecksPage() {
  return (
    <div>
      <PageHeader title="Fact Checks" description="Claims, verdicts, sources, evidence, and civic context." />
      <div className="grid gap-4 md:grid-cols-2">
        {["Federal road allocation doubled this year", "State education budget reached UNESCO benchmark", "New polling units were added in all LGAs"].map((claim, index) => (
          <Card key={claim}>
            <CardContent className="p-5">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-semibold">{claim}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Evidence summary and source links appear here when connected to the backend.</p>
              <Badge className="mt-4" variant={index === 0 ? "info" : "warning"}>{index === 0 ? "MIXED" : "UNVERIFIED"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
