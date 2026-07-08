"use client";

import { ProfileView } from "@/components/profile/profile-view";

export default function ProfileDetailPage({ params }: { params: { slug: string } }) {
  return <ProfileView userId={params.slug} />;
}
