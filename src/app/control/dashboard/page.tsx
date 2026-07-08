import { BarChart3, Flag, ShieldAlert, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ControlDashboardPage() {
  const metrics = [
    ["Users", "128,420", Users],
    ["Open reports", "412", Flag],
    ["Moderation queue", "86", ShieldAlert],
    ["Engagement", "74%", BarChart3]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Control Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Operational overview for users, issues, elections, moderation, and analytics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label as string}</p>
                <p className="mt-1 text-2xl font-bold">{value as string}</p>
              </div>
              <Icon className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Moderation queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["Reported post: misinformation claim", "Issue evidence needs review", "New politician profile pending verification"].map((item) => (
              <div key={item} className="rounded-md border p-3 text-sm">{item}</div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Analytics snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["Issues up 18% this week", "Poll participation up 31%", "Top state: Lagos"].map((item) => (
              <div key={item} className="rounded-md border p-3 text-sm">{item}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
