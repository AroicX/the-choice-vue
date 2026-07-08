import { Vote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const elections = ["2027 Presidential Mock Election", "Lagos Governorship Sentiment Vote", "Senate Priority Ballot"];

export default function ElectionsPage() {
  return (
    <div>
      <PageHeader title="Mock Elections" description="Follow upcoming, live, and completed civic simulations." />
      <div className="grid gap-4 md:grid-cols-3">
        {elections.map((election, index) => (
          <Card key={election}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Vote className="h-6 w-6 text-primary" />
                <Badge variant={index === 0 ? "default" : "secondary"}>{index === 0 ? "Live" : "Upcoming"}</Badge>
              </div>
              <h2 className="mt-5 font-semibold">{election}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{index + 4} candidates · {(index + 1) * 18420} votes</p>
              <Button className="mt-5 w-full" variant={index === 0 ? "default" : "outline"}>{index === 0 ? "Vote" : "View"}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
