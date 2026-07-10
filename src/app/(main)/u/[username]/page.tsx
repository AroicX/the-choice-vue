"use client";

import { PublicUserProfile } from "@/components/profile/public-user-profile";

export default function PublicUserPage({ params }: { params: { username: string } }) {
  return <PublicUserProfile identifier={decodeURIComponent(params.username)} />;
}
