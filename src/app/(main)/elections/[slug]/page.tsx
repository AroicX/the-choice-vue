import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function ElectionDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Election" endpoint={endpoints.elections.detail(params.slug)} action="election" />;
}
