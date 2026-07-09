import { CommunityDetailView } from "@/components/communities/community-detail-view";

export default function CommunityDetailPage({ params }: { params: { slug: string } }) {
  return <CommunityDetailView communityId={params.slug} />;
}
