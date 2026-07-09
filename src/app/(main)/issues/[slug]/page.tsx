import { IssueDetailView } from "@/components/issues/issue-detail-view";

export default function IssueDetailPage({ params }: { params: { slug: string } }) {
  return <IssueDetailView issueId={params.slug} />;
}
