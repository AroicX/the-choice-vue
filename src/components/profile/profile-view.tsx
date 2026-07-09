"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { PostCard } from "@/components/cards/post-card";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { PostCardSkeleton, ProfileSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { userQueries } from "@/services/queries/user.queries";
import {
  Analytics01Icon,
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
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const isOwnProfile = !userId || userId === sessionUser?.id;

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
  const posts = (embeddedPosts.length ? embeddedPosts : fetchedPosts).map((record) => normalizePost(record, sessionUser?.id));
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

  if (!isAuthenticated && isOwnProfile) {
    return (
      <div>
        <PageHeader title="Profile" description="Your civic identity, reputation, posts, and community activity." />
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-muted-foreground">Sign in to view your profile, recent posts, and civic activity.</p>
            <Button onClick={() => openLoginModal("Sign in to view your profile.")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Profile" description="Your civic identity, reputation, posts, and community activity." />
        <ProfileSkeleton />
      </div>
    );
  }

  if (profileQuery.error || !profile) {
    return (
      <div>
        <PageHeader title="Profile" description="Your civic identity, reputation, posts, and community activity." />
        <Card>
          <CardContent className="p-6 text-destructive">
            {profileQuery.error instanceof Error ? profileQuery.error.message : "Profile could not be loaded."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Posts", value: posts.length, icon: Message01Icon },
    { label: "Likes received", value: totalLikes, icon: FavouriteIcon },
    { label: "Rooms joined", value: rooms.length, icon: Door01Icon },
    { label: "Following", value: follows.length, icon: UserCircleIcon }
  ];

  const followingGroups = [
    { label: "Politicians", count: countFollowsByType(follows, "POLITICIAN") },
    { label: "Topics", count: countFollowsByType(follows, "TOPIC") },
    { label: "Citizens", count: countFollowsByType(follows, "USER") }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnProfile ? "Profile" : userDisplayName(profile)}
        description={
          isOwnProfile
            ? "Your civic identity, reputation, posts, and community activity."
            : "Public civic profile, recent posts, and community participation."
        }
        action={
          isOwnProfile ? (
            <Button asChild>
              <Link href="/settings">
                <AppIcon icon={Settings01Icon} size={18} className="mr-2" />
                Edit profile
              </Link>
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={userDisplayName(profile)}
                className="h-24 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-md bg-accent text-3xl font-bold text-accent-foreground">
                {userInitials(profile)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">{userDisplayName(profile)}</h2>
                {profile.verified ? <AppIcon icon={CheckmarkBadge01Icon} size={20} className="text-primary" /> : null}
              </div>
              <p className="mt-1 text-muted-foreground">
                @{profile.username}
                {profile.state ? ` · ${profile.state}` : ""}
              </p>
              {profile.about ? <p className="mt-3 max-w-2xl leading-7 text-foreground">{profile.about}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{profile.role.replaceAll("_", " ")}</Badge>
                {profile.verifiedPhone ? <Badge variant="outline">Verified phone</Badge> : null}
                <Badge variant="outline">{profile.reputationScore ?? 0} reputation</Badge>
              </div>
              {profile.createdAt ? (
                <p className="mt-3 text-sm text-muted-foreground">Joined {formatDate(profile.createdAt)}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <>
                <Button asChild>
                  <Link href="/settings">
                    <AppIcon icon={Edit02Icon} size={18} className="mr-2" />
                    Update profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/issues/create">Report an issue</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/feed">Explore civic feed</Link>
                </Button>
              </>
            ) : (
              <Button onClick={() => { if (!requireAuth("Sign in to follow this citizen.")) return; followMutation.mutate(); }} disabled={followMutation.isPending}>
                <AppIcon icon={UserAdd01Icon} size={18} className="mr-2" />
                Follow citizen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon }) => (
          <Card key={label} className="glass-panel">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <AppIcon icon={icon} size={22} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isOwnProfile ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AppIcon icon={Door01Icon} size={20} className="text-primary" />
                Rooms joined
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roomsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : rooms.length ? (
                rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/discussions/${room.discussionsId ?? room.discussions?.id ?? room.id}`}
                    className="block rounded-md border p-3 transition-colors hover:bg-accent"
                  >
                    <p className="font-medium">{room.discussions?.topic ?? "Discussion room"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {asArray(room.discussions?.polls).length.toLocaleString()} polls in room
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">You have not joined any discourse rooms yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AppIcon icon={Analytics01Icon} size={20} className="text-primary" />
                Following
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {followsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : follows.length ? (
                followingGroups.map((group) => (
                  <div key={group.label} className="flex items-center justify-between rounded-md border p-3">
                    <span className="font-medium">{group.label}</span>
                    <Badge variant="secondary">{group.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">You are not following anyone yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Recent posts</h3>
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
    </div>
  );
}
