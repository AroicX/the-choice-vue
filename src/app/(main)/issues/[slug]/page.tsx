import type { Metadata } from "next";
import { IssueDetailView } from "@/components/issues/issue-detail-view";
import { normalizeIssue } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/issues/${params.slug}`);
  if (!record) return pageMetadata({ title: "Issue", description: "A civic issue reported on Choice9ja.", path: `/issues/${params.slug}` });
  const issue = normalizeIssue(record);
  return pageMetadata({
    title: issue.title,
    description: excerpt(`${issue.location}. ${issue.description}`),
    path: `/issues/${params.slug}`
  });
}

export default function IssueDetailPage({ params }: Props) {
  return <IssueDetailView issueId={params.slug} />;
}
