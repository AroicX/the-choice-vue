import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function PoliticianDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Politician" endpoint={endpoints.politicians.detail(params.slug)} action="politician" />;
}
