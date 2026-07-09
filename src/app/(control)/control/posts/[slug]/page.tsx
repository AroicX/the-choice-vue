"use client";

import { ControlPostDetail } from "@/components/admin/control-post-detail";

export default function ControlPostDetailPage({ params }: { params: { slug: string } }) {
  return <ControlPostDetail postId={params.slug} />;
}
