import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function CommunityDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Community" endpoint={endpoints.communities.detail(params.slug)} action="community" />;
}
