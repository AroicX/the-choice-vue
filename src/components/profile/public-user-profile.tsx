"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { PostCard } from "@/components/cards/post-card";
import { MediaLightbox } from "@/components/media/media-lightbox";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { PostCardSkeleton, ProfileSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  formatDate,
  formatRelativeTime,
  normalizeIssue,
  normalizePost,
  normalizeUserProfile,
  userDisplayName,
  userInitials
} from "@/lib/content-utils";
import {
  CheckmarkBadge01Icon,
  Comment01Icon,
  FavouriteIcon,
  ImageAdd01Icon,
  Message01Icon,
  Settings01Icon,
  UserAdd01Icon,
  Video01Icon
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { userQueries } from "@/services/queries/user.queries";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, MediaAttachment } from "@/types";

type ProfileTab = "posts" | "media" | "likes" | "comments" | "votes" | "issues";

const TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "votes", label: "Votes" },
  { id: "issues", label: "Issues" }
];

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
      <p className="text-xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function PublicUserProfile({ identifier }: { identifier: string }) {
  const queryClient = useQueryClient();
  const sessionUser = useAuthStore((state) => state.user);
  const { requireAuth } = useRequireAuth();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handle = identifier.replace(/^@+/, "");

  const profileQuery = useQuery({
    queryKey: ["public-profile", handle],
    queryFn: () => userQueries.publicProfile(handle),
    enabled: Boolean(handle)
  });

  const profile = profileQuery.data ? normalizeUserProfile(profileQuery.data as ApiRecord) : null;
  const isSelf = Boolean(profile?.viewer?.isSelf || (sessionUser && profile && sessionUser.id === profile.id));

  const postsQuery = useQuery({
    queryKey: ["public-profile", handle, "posts"],
    queryFn: () => userQueries.publicPosts(handle),
    enabled: Boolean(handle) && tab === "posts"
  });

  const mediaQuery = useQuery({
    queryKey: ["public-profile", handle, "media"],
    queryFn: () => userQueries.publicMedia(handle),
    enabled: Boolean(handle) && (tab === "media" || lightboxIndex != null)
  });

  const likesQuery = useQuery({
    queryKey: ["public-profile", handle, "likes"],
    queryFn: () => userQueries.publicLikes(handle),
    enabled: Boolean(handle) && tab === "likes"
  });

  const commentsQuery = useQuery({
    queryKey: ["public-profile", handle, "comments"],
    queryFn: () => userQueries.publicComments(handle),
    enabled: Boolean(handle) && tab === "comments"
  });

  const votesQuery = useQuery({
    queryKey: ["public-profile", handle, "votes"],
    queryFn: () => userQueries.publicVotes(handle),
    enabled: Boolean(handle) && tab === "votes"
  });

  const issuesQuery = useQuery({
    queryKey: ["public-profile", handle, "issues"],
    queryFn: () => userQueries.publicIssues(handle),
    enabled: Boolean(handle) && tab === "issues"
  });

  const posts = useMemo(
    () => asArrayPosts(postsQuery.data?.items).map((record) => normalizePost(record, sessionUser?.id)),
    [postsQuery.data, sessionUser?.id]
  );
  const likedPosts = useMemo(
    () => asArrayPosts(likesQuery.data?.items).map((record) => normalizePost(record, sessionUser?.id)),
    [likesQuery.data, sessionUser?.id]
  );
  const mediaItems = useMemo(() => {
    return (mediaQuery.data?.items ?? []).map((item) => {
      const record = item as ApiRecord;
      return {
        id: String(record.id ?? record.url),
        url: String(record.url ?? ""),
        type: (record.type === "video" ? "video" : "image") as MediaAttachment["type"],
        postId: record.postId ? String(record.postId) : undefined,
        postMessage: record.postMessage ? String(record.postMessage) : undefined
      };
    }).filter((item) => item.url);
  }, [mediaQuery.data]);

  const lightboxItems: MediaAttachment[] = mediaItems.map(({ id, url, type }) => ({ id, url, type }));

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile unavailable.");
      if (profile.viewer?.isFollowing) {
        return api.delete(endpoints.follows.unfollowUser(profile.id));
      }
      return api.post(endpoints.follows.followUser(profile.id));
    },
    onSuccess: () => {
      gooeyToast.success(profile?.viewer?.isFollowing ? "Unfollowed" : "Following");
      queryClient.invalidateQueries({ queryKey: ["public-profile", handle] });
    },
    onError: (error) => {
      gooeyToast.error("Could not update follow", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  if (profileQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Citizen profile" description="Posts, media, votes, and civic engagement." />
        <ProfileSkeleton />
      </div>
    );
  }

  if (profileQuery.error || !profile) {
    return (
      <div>
        <PageHeader title="Citizen profile" description="Posts, media, votes, and civic engagement." />
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="font-semibold">Profile not found</p>
            <p className="text-sm text-muted-foreground">
              {profileQuery.error instanceof Error
                ? profileQuery.error.message
                : `No citizen matched @${handle}.`}
            </p>
            <Button asChild variant="outline">
              <Link href="/feed">Back to feed</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = profile.stats;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/10">
        <div className="h-28 bg-gradient-to-r from-primary/20 via-emerald-500/10 to-sky-500/10 sm:h-36" />
        <CardContent className="relative space-y-5 px-5 pb-6 pt-0 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.profilePic ? (
                <Image
                  src={profile.profilePic}
                  alt={userDisplayName(profile)}
                  width={112}
                  height={112}
                  className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-sm sm:h-28 sm:w-28"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-background bg-primary/15 text-2xl font-bold text-primary shadow-sm sm:h-28 sm:w-28 sm:text-3xl">
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
              {isSelf ? (
                <>
                  <Button asChild>
                    <Link href="/profile">Edit profile</Link>
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
                  variant={profile.viewer?.isFollowing ? "outline" : "default"}
                >
                  <AppIcon icon={UserAdd01Icon} size={16} className="mr-2" />
                  {profile.viewer?.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          {profile.about ? <p className="max-w-2xl text-sm leading-7 text-foreground sm:text-base">{profile.about}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{profile.role.replaceAll("_", " ")}</Badge>
            {profile.verifiedPhone ? <Badge variant="outline">Verified phone</Badge> : null}
            <Badge variant="outline">{profile.reputationScore ?? 0} reputation</Badge>
            {profile.createdAt ? <Badge variant="outline">Joined {formatDate(profile.createdAt)}</Badge> : null}
          </div>

          {stats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatChip label="Posts" value={stats.posts} />
              <StatChip label="Likes" value={stats.likesReceived} />
              <StatChip label="Comments" value={stats.comments} />
              <StatChip label="Votes" value={stats.votes} />
              <StatChip label="Media" value={stats.media} />
              <StatChip label="Followers" value={stats.followers} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "posts" ? (
        <QueryListState
          isLoading={postsQuery.isLoading}
          isEmpty={!posts.length}
          count={3}
          skeleton={<PostCardSkeleton />}
          emptyMessage="No posts yet."
          className="space-y-4"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </QueryListState>
      ) : null}

      {tab === "likes" ? (
        <QueryListState
          isLoading={likesQuery.isLoading}
          isEmpty={!likedPosts.length}
          count={3}
          skeleton={<PostCardSkeleton />}
          emptyMessage="No liked posts yet."
          className="space-y-4"
        >
          {likedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </QueryListState>
      ) : null}

      {tab === "media" ? (
        mediaQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : mediaItems.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.postId}-${item.url}`}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                {item.type === "video" ? (
                  <div className="grid h-full place-items-center bg-slate-900 text-white">
                    <AppIcon icon={Video01Icon} size={28} />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                )}
                <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                  <AppIcon icon={item.type === "video" ? Video01Icon : ImageAdd01Icon} size={12} className="inline" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={ImageAdd01Icon} message="No media attachments yet." />
        )
      ) : null}

      {tab === "comments" ? (
        commentsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : commentsQuery.data?.items.length ? (
          <div className="space-y-3">
            {commentsQuery.data.items.map((item) => {
              const comment = item as ApiRecord;
              const post = comment.posts as ApiRecord | undefined;
              return (
                <Card key={String(comment.id)}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AppIcon icon={Comment01Icon} size={14} />
                      {comment.createdAt ? formatRelativeTime(String(comment.createdAt)) : "Comment"}
                    </div>
                    <p className="text-sm leading-6">{String(comment.message ?? "")}</p>
                    {post?.id ? (
                      <Link
                        href={`/threads/post/${post.id}`}
                        className="block rounded-xl border border-border/70 bg-muted/40 p-3 transition hover:bg-accent/40"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">On post</p>
                        <p className="mt-1 line-clamp-2 text-sm">{String(post.message ?? "View post")}</p>
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Comment01Icon} message="No comments yet." />
        )
      ) : null}

      {tab === "votes" ? (
        votesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : votesQuery.data?.items.length ? (
          <div className="space-y-3">
            {votesQuery.data.items.map((item) => {
              const vote = item as ApiRecord;
              const poll = vote.poll as ApiRecord | null | undefined;
              const election = vote.election as ApiRecord | null | undefined;
              const isPoll = String(vote.targetType) === "POLL";
              const href = isPoll && poll?.id
                ? `/polls/${poll.id}`
                : election?.id
                  ? `/elections/${election.id}`
                  : null;
              const title = isPoll
                ? String(poll?.question ?? "Poll vote")
                : String(election?.title ?? "Election vote");

              const content = (
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Badge variant="secondary">{isPoll ? "Poll" : "Election"}</Badge>
                    <p className="mt-2 font-medium">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vote.optionId ? `Option ${String(vote.optionId)}` : "Voted"}
                      {vote.createdAt ? ` · ${formatRelativeTime(String(vote.createdAt))}` : ""}
                    </p>
                  </div>
                </CardContent>
              );

              return href ? (
                <Link key={String(vote.id)} href={href} className="block rounded-xl transition hover:opacity-95">
                  <Card>{content}</Card>
                </Link>
              ) : (
                <Card key={String(vote.id)}>{content}</Card>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={FavouriteIcon} message="No poll or election votes yet." />
        )
      ) : null}

      {tab === "issues" ? (
        issuesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : issuesQuery.data?.items.length ? (
          <div className="space-y-3">
            {issuesQuery.data.items.map((item) => {
              const issue = normalizeIssue(item as ApiRecord);
              return (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                  <Card className="transition hover:border-primary/30">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{issue.status}</Badge>
                        {issue.location ? <Badge variant="outline">{issue.location}</Badge> : null}
                      </div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.upvotes.toLocaleString()} upvotes
                        {issue.createdAt ? ` · ${formatRelativeTime(issue.createdAt)}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Message01Icon} message="No issues reported yet." />
        )
      ) : null}

      {lightboxIndex != null && lightboxItems.length ? (
        <MediaLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: typeof Message01Icon; message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <AppIcon icon={icon} size={22} />
        </span>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function asArrayPosts(value: unknown) {
  if (!value) return [] as ApiRecord[];
  if (Array.isArray(value)) return value as ApiRecord[];
  return [] as ApiRecord[];
}
