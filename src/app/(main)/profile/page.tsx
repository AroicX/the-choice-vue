import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your civic identity, reputation, saved posts, followed topics, and reports." />
      <Card>
        <CardContent className="p-5">
          <div className="grid h-20 w-20 place-items-center rounded-md bg-accent text-2xl font-bold text-accent-foreground">GB</div>
          <h2 className="mt-4 text-xl font-semibold">Gabriel</h2>
          <p className="text-muted-foreground">@gabriel · Lagos</p>
        </CardContent>
      </Card>
    </div>
  );
}
