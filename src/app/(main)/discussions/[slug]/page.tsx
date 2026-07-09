import { DiscourseRoomView } from "@/components/discourse/discourse-room-view";

export default function DiscussionDetailPage({ params }: { params: { slug: string } }) {
  return <DiscourseRoomView discussionId={params.slug} />;
}
