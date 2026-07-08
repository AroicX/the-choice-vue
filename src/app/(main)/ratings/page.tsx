import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

const categories = ["President", "Governors", "Senate", "House of Representatives", "State Assembly", "Local Government"];

export default function RatingsPage() {
  return (
    <div>
      <PageHeader title="Ratings Hub" description="Compare approval, performance, transparency, and public accountability." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, index) => (
          <Card key={category}>
            <CardContent className="p-5">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-semibold">{category}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Rate leaders, inspect category leaderboards, and compare public performance.</p>
              <p className="mt-4 text-2xl font-bold">{62 + index * 3}%</p>
              <p className="text-sm text-muted-foreground">Average approval</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
