import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Account, privacy, notifications, and display preferences." />
      <Card><CardContent className="p-5">Settings controls will connect to `/api/users/me` and notification preferences.</CardContent></Card>
    </div>
  );
}
