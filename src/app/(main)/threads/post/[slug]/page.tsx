import { DetailView } from "@/components/content/detail-view";
import { endpoints } from "@/services/client/endpoints";

export default function ThreadPostPage({ params }: { params: { slug: string } }) {
  return <DetailView title="Post" endpoint={endpoints.posts.detail(params.slug)} action="post" />;
}
