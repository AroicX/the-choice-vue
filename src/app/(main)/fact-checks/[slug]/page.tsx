import { FactCheckDetailView } from "@/components/fact-checks/fact-check-detail-view";

export default function FactCheckDetailPage({ params }: { params: { slug: string } }) {
  return <FactCheckDetailView factCheckId={params.slug} />;
}
