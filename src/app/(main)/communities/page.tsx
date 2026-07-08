import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunitiesPage() {
  return (
    <div>
      <PageHeader title="Communities" description="Follow state, local, issue-based, and verified organization communities." />
      <div className="grid gap-4 md:grid-cols-3">
        {["Lagos Civic Watch", "Abuja Transport Forum", "Education Reform Nigeria", "Verified CSOs", "Youth Policy Circle", "Healthcare Access"].map((name) => (
          <Card key={name}>
            <CardContent className="p-5">
              <h2 className="font-semibold">{name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Members, posts, events, and discussion rooms.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
