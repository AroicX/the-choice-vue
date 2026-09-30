import type { Metadata } from "next";
import { DiscourseRoomView } from "@/components/discourse/discourse-room-view";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/discussions/${params.slug}`);
  if (!record) return pageMetadata({ title: "Discussion", description: "A civic discussion room on Choice9ja.", path: `/discussions/${params.slug}` });
  return pageMetadata({
    title: excerpt(record.topic, 70),
    description: excerpt(record.question ?? record.description) || "A civic discussion room on Choice9ja.",
    path: `/discussions/${params.slug}`
  });
}

export default function DiscussionDetailPage({ params }: Props) {
  return <DiscourseRoomView discussionId={params.slug} />;
}
