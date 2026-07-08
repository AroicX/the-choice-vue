import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function DiscussionDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Discussion" endpoint={endpoints.discussions.detail(params.slug)} action="discussion" />;
}
