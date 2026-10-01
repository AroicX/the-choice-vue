"use client";

import { PublicUserProfile } from "@/components/profile/public-user-profile";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";

/** Your own profile: the same page everyone else sees, with Edit profile. */
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hasHydrated);
  const openLoginModal = useLoginModalStore((state) => state.open);

  if (!hydrated) return null;
  if (!user?.username) {
    return (
      <div className="mx-auto max-w-[400px] px-8 py-12">
        <p className="text-[22px] font-bold leading-7 sm:text-[28px] sm:leading-9 tracking-tight">Your profile</p>
        <p className="mt-2 text-[15px] leading-5 text-muted-foreground">Sign in to see your posts, votes and issues in one place.</p>
        <Button size="lg" className="mt-7" onClick={() => openLoginModal("Sign in to view your profile.")}>
          Sign in
        </Button>
      </div>
    );
  }
  return <PublicUserProfile identifier={user.username} />;
}
