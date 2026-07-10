"use client";

import { PublicUserProfile } from "@/components/profile/public-user-profile";

export default function ProfileDetailPage({ params }: { params: { slug: string } }) {
  return <PublicUserProfile identifier={decodeURIComponent(params.slug)} />;
}
