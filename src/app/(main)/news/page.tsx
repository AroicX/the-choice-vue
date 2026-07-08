import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div>
      <PageHeader title="Civic News" description="Curated public-interest news across politics, economy, security, and governance." />
      <div className="space-y-4">
        {["Budget office releases Q2 implementation memo", "Governors forum debates healthcare financing", "INEC opens public comments on polling unit logistics"].map((title) => (
          <Card key={title}>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-primary">Governance</p>
              <h2 className="mt-2 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-muted-foreground">A concise civic news summary with source attribution and related leaders.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
