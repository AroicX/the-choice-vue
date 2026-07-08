import { Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" description="Issue updates, poll reminders, replies, and community activity." />
      <div className="space-y-3">
        {["Your tracked issue moved to in progress", "New poll opened in Economy Watch", "A scorecard you follow was updated"].map((item) => (
          <Card key={item}>
            <CardContent className="flex items-center gap-4 p-4">
              <Bell className="h-5 w-5 text-primary" />
              <p>{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
