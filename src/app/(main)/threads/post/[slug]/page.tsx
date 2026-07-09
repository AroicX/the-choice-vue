import { PostDetailView } from "@/components/posts/post-detail-view";

export default function ThreadPostPage({ params }: { params: { slug: string } }) {
  return <PostDetailView slug={params.slug} />;
}
