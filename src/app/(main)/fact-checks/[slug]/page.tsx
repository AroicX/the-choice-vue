import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function FactCheckDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Fact Check" endpoint={endpoints.factChecks.detail(params.slug)} />;
}
