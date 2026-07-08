import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  return <DetailView title="News" endpoint={endpoints.news.detail(params.slug)} />;
}
