import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function IssueDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Issue" endpoint={endpoints.issues.detail(params.slug)} action="issue" />;
}
