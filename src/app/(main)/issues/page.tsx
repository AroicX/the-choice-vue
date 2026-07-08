import Link from "next/link";
import { IssueCard } from "@/components/cards/issue-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TabList } from "@/components/ui/tabs";
import { issues } from "@/lib/mock-data";

export default function IssuesPage() {
  return (
    <div>
      <PageHeader
        title="Citizen Issues"
        description="Raise, track, and organize local and national public-service issues."
        action={<Button asChild><Link href="/issues/create">Create issue</Link></Button>}
      />
      <TabList tabs={["Trending", "Local", "National", "Resolved", "My Issues"]} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {issues.concat(issues).map((issue, index) => <IssueCard key={`${issue.id}-${index}`} issue={issue} />)}
      </div>
    </div>
  );
}
