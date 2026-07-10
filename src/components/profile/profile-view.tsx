"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { PostCard } from "@/components/cards/post-card";
import { ProfileEditModal, type ProfileUpdatePayload } from "@/components/profile/profile-edit-modal";
import { QueryListState } from "@/components/shared/query-states";
import { PostCardSkeleton, ProfileSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { userQueries } from "@/services/queries/user.queries";
import {
  CheckmarkBadge01Icon,
  Door01Icon,
  Edit02Icon,
  FavouriteIcon,
  Message01Icon,
  Settings01Icon,
  UserAdd01Icon,
  UserCircleIcon
} from "@/lib/icons";
import {
  asArray,
  formatDate,
  normalizePost,
  normalizeUserProfile,
  profilePath,
  userDisplayName,
  userInitials
} from "@/lib/content-utils";
import type { ApiRecord, FollowRecord, RoomRecord, User } from "@/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";

type ProfileViewProps = {
  userId?: string;
};

function countFollowsByType(follows: FollowRecord[], type: FollowRecord["targetType"]) {
  return follows.filter((follow) => follow.targetType === type).length;
}

function sumPostLikes(posts: ApiRecord[]) {
  return posts.reduce((total, post) => total + Number(post.likes ?? 0), 0);
}

export function ProfileView({ userId }: ProfileViewProps) {
  const queryClient = useQueryClient();
  const sessionUser = useAuthStore((state) => state.user);
  const setSessionUser = useAuthStore.setState;
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const isOwnProfile = !userId || userId === sessionUser?.id;
  const [editOpen, setEditOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", isOwnProfile ? "me" : userId],
    queryFn: () => (isOwnProfile ? userQueries.me() : userQueries.profile(userId!)),
    enabled: isOwnProfile ? isAuthenticated : Boolean(userId)
  });

  const profile = profileQuery.data ? normalizeUserProfile(profileQuery.data as ApiRecord) : null;
  const profileId = profile?.id ?? userId ?? sessionUser?.id ?? "";

  const postsQuery = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: () => userQueries.posts(profileId),
    enabled: Boolean(profileId) && !profile?.posts?.length
  });

  const followsQuery = useQuery({
    queryKey: ["profile-follows", profileId],
    queryFn: userQueries.follows,
    enabled: isOwnProfile && isAuthenticated
  });

  const roomsQuery = useQuery({
    queryKey: ["profile-rooms", profileId],
    queryFn: userQueries.rooms,
    enabled: isOwnProfile && isAuthenticated
  });

  const embeddedPosts = asArray<ApiRecord>(profile?.posts);
  const fetchedPosts = asArray<ApiRecord>(postsQuery.data);
  const posts = (embeddedPosts.length ? embeddedPosts : fetchedPosts).map((record) =>
    normalizePost(record, sessionUser?.id)
  );
  const follows = asArray<FollowRecord>(followsQuery.data);
  const rooms = asArray<RoomRecord>(roomsQuery.data);
  const totalLikes = sumPostLikes(embeddedPosts.length ? embeddedPosts : fetchedPosts);

  const followMutation = useMutation({
    mutationFn: () => {
      if (!profileId) throw new Error("Profile unavailable.");
      return api.post(endpoints.follows.followUser(profileId));
    },
    onSuccess: () => {
      gooeyToast.success("You are now following this user");
      queryClient.invalidateQueries({ queryKey: ["profile-follows"] });
    },
    onError: (error) => {
      gooeyToast.error("Follow failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const response = await api.patch(endpoints.users.update, payload);
      return response.data && typeof response.data === "object" && "data" in response.data
        ? (response.data.data as User)
        : (response.data as User);
    },
    onSuccess: (updatedUser) => {
      const normalized = normalizeUserProfile(updatedUser as ApiRecord);
      setSessionUser((state) => ({ user: state.user ? { ...state.user, ...normalized } : normalized }));
      gooeyToast.success("Profile updated");
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", sessionUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: (error) => {
      gooeyToast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  if (!isAuthenticated && isOwnProfile) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <AppIcon icon={UserCircleIcon} size={28} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to view your profile, posts, and settings.</p>
          </div>
          <Button onClick={() => openLoginModal("Sign in to view your profile.")}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (profileQuery.isLoading) return <ProfileSkeleton />;

  if (profileQuery.error || !profile) {
    return (
      <Card>
        <CardContent className="p-6 text-destructive">
          {profileQuery.error instanceof Error ? profileQuery.error.message : "Profile could not be loaded."}
        </CardContent>
      </Card>
    );
  }

  const followingGroups = [
    { label: "Politicians", count: countFollowsByType(follows, "POLITICIAN") },
    { label: "Topics", count: countFollowsByType(follows, "TOPIC") },
    { label: "Citizens", count: countFollowsByType(follows, "USER") }
  ];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border/70">
        <div className="relative h-28 bg-gradient-to-br from-primary/25 via-emerald-500/15 to-sky-500/20 sm:h-36">
          {isOwnProfile ? (
            <Link
              href="/settings"
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
              aria-label="Settings"
            >
              <AppIcon icon={Settings01Icon} size={18} />
            </Link>
          ) : null}
        </div>

        <CardContent className="relative space-y-5 px-4 pb-5 pt-0 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profilePic}
                  alt={userDisplayName(profile)}
                  className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-sm sm:h-28 sm:w-28"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-background bg-primary/15 text-2xl font-bold text-primary shadow-sm sm:h-28 sm:w-28 sm:text-3xl">
                  {userInitials(profile)}
                </div>
              )}
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight">{userDisplayName(profile)}</h1>
                  {profile.verified || profile.verifiedPhone ? (
                    <AppIcon icon={CheckmarkBadge01Icon} size={20} className="shrink-0 text-primary" />
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  @{profile.username}
                  {profile.state ? ` · ${profile.state}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Button onClick={() => setEditOpen(true)}>
                    <AppIcon icon={Edit02Icon} size={16} className="mr-2" />
                    Edit profile
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/settings">
                      <AppIcon icon={Settings01Icon} size={16} className="mr-2" />
                      Settings
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (!requireAuth("Sign in to follow this citizen.")) return;
                    followMutation.mutate();
                  }}
                  disabled={followMutation.isPending}
                >
                  <AppIcon icon={UserAdd01Icon} size={16} className="mr-2" />
                  Follow
                </Button>
              )}
            </div>
          </div>

          {profile.about ? <p className="max-w-2xl text-sm leading-7 text-foreground sm:text-[15px]">{profile.about}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{profile.role.replaceAll("_", " ")}</Badge>
            {profile.verifiedPhone ? <Badge variant="outline">Verified phone</Badge> : null}
            <Badge variant="outline">{profile.reputationScore ?? 0} reputation</Badge>
            {profile.createdAt ? <Badge variant="outline">Joined {formatDate(profile.createdAt)}</Badge> : null}
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3 sm:gap-3 sm:p-4">
            {[
              { label: "Posts", value: posts.length, icon: Message01Icon },
              { label: "Likes", value: totalLikes, icon: FavouriteIcon },
              { label: "Rooms", value: rooms.length, icon: Door01Icon },
              { label: "Following", value: follows.length, icon: UserCircleIcon }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-bold tabular-nums sm:text-xl">{stat.value.toLocaleString()}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {isOwnProfile ? (
            <Link
              href="/settings"
              className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 transition hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <AppIcon icon={Settings01Icon} size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Account settings</p>
                  <p className="text-xs text-muted-foreground">Security, notifications, privacy & theme</p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">Open</span>
            </Link>
          ) : null}
        </CardContent>
      </Card>

      {isOwnProfile ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Rooms</h2>
                <Link href="/discourse" className="text-xs font-medium text-primary hover:underline">
                  Browse
                </Link>
              </div>
              {roomsQuery.isLoading ? (
                <div className="space-y-2">
                  <div className="h-12 animate-pulse rounded-xl bg-muted" />
                  <div className="h-12 animate-pulse rounded-xl bg-muted" />
                </div>
              ) : rooms.length ? (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/discussions/${room.discussionsId ?? room.discussions?.id ?? room.id}`}
                      className="block rounded-xl border border-border/70 p-3 transition hover:bg-accent/40"
                    >
                      <p className="text-sm font-medium">{room.discussions?.topic ?? "Discussion room"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {asArray(room.discussions?.polls).length.toLocaleString()} polls
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No rooms joined yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4 sm:p-5">
              <h2 className="font-semibold">Following</h2>
              {followsQuery.isLoading ? (
                <div className="space-y-2">
                  <div className="h-10 animate-pulse rounded-xl bg-muted" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted" />
                </div>
              ) : follows.length ? (
                followingGroups.map((group) => (
                  <div key={group.label} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2.5">
                    <span className="text-sm font-medium">{group.label}</span>
                    <Badge variant="secondary">{group.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Not following anyone yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Posts</h2>
          {isOwnProfile && profile.username ? (
            <Link href={profilePath(profile)} className="text-xs font-medium text-primary hover:underline">
              Public view
            </Link>
          ) : null}
        </div>
        <QueryListState
          isLoading={postsQuery.isLoading && !embeddedPosts.length}
          isEmpty={!posts.length}
          count={2}
          skeleton={<PostCardSkeleton />}
          emptyMessage="No posts published yet."
          className="space-y-4"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </QueryListState>
      </section>

      {isOwnProfile ? (
        <ProfileEditModal
          open={editOpen}
          user={profile}
          loading={updateProfileMutation.isPending}
          onClose={() => setEditOpen(false)}
          onSubmit={(payload) => updateProfileMutation.mutate(payload)}
        />
      ) : null}
    </div>
  );
}
