import { ElectionDetailView } from "@/components/elections/election-detail-view";

export default function ElectionDetailPage({ params }: { params: { slug: string } }) {
  return <ElectionDetailView electionId={params.slug} />;
}
