"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IssueCard } from "@/components/cards/issue-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { IssueCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Button } from "@/components/ui/button";
import { TabList } from "@/components/ui/tabs";
import { civicQueries } from "@/services/queries/civic.queries";
import { asArray, normalizeIssue } from "@/lib/content-utils";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

const tabs = ["Trending", "Local", "National", "Resolved", "My Issues"];

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <IssueCardSkeleton key={index} />)}</div>}>
      <IssuesContent />
    </Suspense>
  );
}

function IssuesContent() {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? tabs[0];
  const user = useAuthStore((state) => state.user);
  const query = useQuery({
    queryKey: ["issues"],
    queryFn: civicQueries.issues
  });
  const rawIssues = asArray<ApiRecord>(query.data);
  const filtered = rawIssues.filter((issue) => {
    if (active === "Local") return String(issue.type ?? "").toUpperCase() === "LOCAL";
    if (active === "National") return String(issue.type ?? "").toUpperCase() === "NATIONAL";
    if (active === "Resolved") return String(issue.status ?? "").toUpperCase() === "RESOLVED";
    if (active === "My Issues") return Boolean(user?.id && String((issue.createdBy as ApiRecord | undefined)?.id ?? issue.userId ?? issue.createdById) === user.id);
    return true;
  });
  const issues = filtered.map(normalizeIssue);

  return (
    <div>
      <PageHeader
        title="Citizen Issues"
        description="Raise, track, and organize local and national public-service issues."
        action={<Button asChild><Link href="/issues/create">Create issue</Link></Button>}
      />
      <TabList tabs={tabs} active={active} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <QueryListState
          isLoading={query.isLoading}
          isEmpty={issues.length === 0}
          count={4}
          skeleton={<IssueCardSkeleton />}
          emptyMessage="No issues found for this tab."
        >
          {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </QueryListState>
      </div>
    </div>
  );
}
