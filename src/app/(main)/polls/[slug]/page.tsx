import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function PollDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Poll" endpoint={endpoints.polls.detail(params.slug)} action="poll" />;
}
