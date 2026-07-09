import { PoliticianDetailView } from "@/components/politicians/politician-detail-view";

export default function PoliticianDetailPage({ params }: { params: { slug: string } }) {
  return <PoliticianDetailView politicianId={params.slug} />;
}
