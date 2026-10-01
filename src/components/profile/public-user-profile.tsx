"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { IssueCard } from "@/components/cards/issue-card";
import { PostCard } from "@/components/cards/post-card";
import { RoomCover } from "@/components/discourse/room-cover";
import { MediaLightbox } from "@/components/media/media-lightbox";
import { ProfileEditModal, type ProfileUpdatePayload } from "@/components/profile/profile-edit-modal";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  formatRelativeTime,
  normalizeIssue,
  normalizePost,
  normalizeUserProfile,
  userDisplayName,
  userInitials
} from "@/lib/content-utils";
import { ArrowLeft01Icon, CheckmarkBadge01Icon, Location01Icon, Video01Icon } from "@/lib/icons";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { userQueries } from "@/services/queries/user.queries";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, MediaAttachment, User } from "@/types";

type ProfileTab = "posts" | "media" | "likes" | "comments" | "votes" | "issues";

const TABS: TimelineTab<ProfileTab>[] = [
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Replies" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
  { id: "votes", label: "Votes" },
  { id: "issues", label: "Issues" }
];

const items = (value: unknown) => (Array.isArray(value) ? (value as ApiRecord[]) : []);

function Rows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <PostRowSkeleton key={index} />
      ))}
    </>
  );
}

/**
 * The one profile page, X-style: cover, avatar, bio, counts and activity
 * tabs. On your own profile the action is "Edit profile" (opens the editor).
 */
export function PublicUserProfile({ identifier }: { identifier: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionUser = useAuthStore((state) => state.user);
  const { requireAuth } = useRequireAuth();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);

  const handle = identifier.replace(/^@+/, "");
  const profileQuery = useQuery({
    queryKey: ["public-profile", handle, sessionUser?.id ?? null],
    queryFn: () => userQueries.publicProfile(handle),
    enabled: Boolean(handle)
  });
  const profile = profileQuery.data ? normalizeUserProfile(profileQuery.data as ApiRecord) : null;
  const isSelf = Boolean(profile?.viewer?.isSelf || (sessionUser && profile && sessionUser.id === profile.id));
  const isFollowing = following ?? Boolean(profile?.viewer?.isFollowing);

  const enabled = (which: ProfileTab) => Boolean(handle) && tab === which;
  const postsQuery = useQuery({ queryKey: ["public-profile", handle, "posts"], queryFn: () => userQueries.publicPosts(handle), enabled: enabled("posts") });
  const mediaQuery = useQuery({
    queryKey: ["public-profile", handle, "media"],
    queryFn: () => userQueries.publicMedia(handle),
    enabled: Boolean(handle) && (tab === "media" || lightboxIndex != null)
  });
  const likesQuery = useQuery({ queryKey: ["public-profile", handle, "likes"], queryFn: () => userQueries.publicLikes(handle), enabled: enabled("likes") });
  const commentsQuery = useQuery({ queryKey: ["public-profile", handle, "comments"], queryFn: () => userQueries.publicComments(handle), enabled: enabled("comments") });
  const votesQuery = useQuery({ queryKey: ["public-profile", handle, "votes"], queryFn: () => userQueries.publicVotes(handle), enabled: enabled("votes") });
  const issuesQuery = useQuery({ queryKey: ["public-profile", handle, "issues"], queryFn: () => userQueries.publicIssues(handle), enabled: enabled("issues") });

  const posts = useMemo(() => items(postsQuery.data?.items).map((record) => normalizePost(record, sessionUser?.id)), [postsQuery.data, sessionUser?.id]);
  const liked = useMemo(() => items(likesQuery.data?.items).map((record) => normalizePost(record, sessionUser?.id)), [likesQuery.data, sessionUser?.id]);
  const media = useMemo(
    () =>
      items(mediaQuery.data?.items)
        .map((record) => ({
          id: String(record.id ?? record.url),
          url: String(record.url ?? ""),
          type: (record.type === "video" ? "video" : "image") as MediaAttachment["type"]
        }))
        .filter((item) => item.url),
    [mediaQuery.data]
  );

  const follow = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile unavailable.");
      return isFollowing ? api.delete(endpoints.follows.unfollowUser(profile.id)) : api.post(endpoints.follows.followUser(profile.id));
    },
    onMutate: () => setFollowing(!isFollowing),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["public-profile", handle] }),
    onError: (error) => {
      setFollowing(null);
      gooeyToast.error("Couldn’t update follow", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const update = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const response = await api.patch(endpoints.users.update, payload);
      const body = response.data as { data?: User } | User;
      return (body && typeof body === "object" && "data" in body ? body.data : body) as User;
    },
    onSuccess: (updated) => {
      const normalized = normalizeUserProfile(updated as unknown as ApiRecord);
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...normalized } : normalized }));
      gooeyToast.success("Profile updated");
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      // A new username changes this page's address.
      if (normalized.username && normalized.username !== handle) router.replace(`/u/${normalized.username}`);
    },
    onError: (error) => gooeyToast.error("Couldn’t update your profile", { description: error instanceof Error ? error.message : "Try again." })
  });

  const backBar = (
    <div className="sticky top-[var(--app-bar,53px)] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/home"))}
        aria-label="Back"
        className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
      >
        <AppIcon icon={ArrowLeft01Icon} size={20} />
      </button>
      <div className="min-w-0">
        <p className="truncate text-[17px] font-bold leading-5">{profile ? userDisplayName(profile) : "Profile"}</p>
        {profile?.stats ? (
          <p className="text-[13px] text-muted-foreground">
            {profile.stats.posts.toLocaleString()} {profile.stats.posts === 1 ? "post" : "posts"}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (profileQuery.isLoading) {
    return (
      <>
        {backBar}
        <Skeleton className="aspect-[3/1] w-full rounded-none" />
        <div className="px-4">
          <Skeleton className="-mt-12 size-24 rounded-full ring-4 ring-background" />
          <Skeleton className="mt-3 h-6 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      </>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <>
        {backBar}
        <TimelineEmpty title="This account doesn’t exist" body={`No one is using @${handle}. Try searching for someone else.`} href="/home" action="Back to home" />
      </>
    );
  }

  const stats = profile.stats;
  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      {backBar}
      <RoomCover seed={profile.id} text={profile.state ?? ""} className="aspect-[3/1] w-full" />

      <section className="px-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <span className="relative -mt-12 size-24 shrink-0 overflow-hidden rounded-full bg-secondary ring-4 ring-background sm:-mt-16 sm:size-32">
            {profile.profilePic ? (
              <Image src={profile.profilePic} alt="" fill className="object-cover" sizes="128px" priority />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-3xl font-bold" aria-hidden>
                {userInitials(profile)}
              </span>
            )}
          </span>
          <div className="pt-3">
            {isSelf ? (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "inverted"}
                disabled={follow.isPending}
                onClick={() => {
                  if (!requireAuth("Sign in to follow this citizen.")) return;
                  follow.mutate();
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <h1 className="mt-3 flex items-center gap-1.5 text-[19px] font-bold leading-6 tracking-tight sm:text-xl">
          <span className="min-w-0 truncate">{userDisplayName(profile)}</span>
          {profile.verified || profile.verifiedPhone ? <AppIcon icon={CheckmarkBadge01Icon} size={20} className="shrink-0 text-primary" /> : null}
        </h1>
        <p className="text-[15px] text-muted-foreground">@{profile.username}</p>

        {profile.about ? <p className="mt-3 whitespace-pre-line text-[15px] leading-5">{profile.about}</p> : null}

        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-muted-foreground">
          {profile.state ? (
            <span className="inline-flex items-center gap-1">
              <AppIcon icon={Location01Icon} size={16} />
              {profile.state}
            </span>
          ) : null}
          {joined ? <span>Joined {joined}</span> : null}
        </p>

        {stats ? (
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted-foreground">
            <span>
              <strong className="font-bold text-foreground">{stats.followers.toLocaleString()}</strong> {stats.followers === 1 ? "Follower" : "Followers"}
            </span>
            <span>
              <strong className="font-bold text-foreground">{stats.likesReceived.toLocaleString()}</strong> {stats.likesReceived === 1 ? "Like" : "Likes"}
            </span>
            <span>
              <strong className="font-bold text-foreground">{stats.votes.toLocaleString()}</strong> {stats.votes === 1 ? "Vote" : "Votes"}
            </span>
          </p>
        ) : null}
      </section>

      <TimelineHeader tabs={TABS} active={tab} onSelect={setTab} className="static border-t" />

      <div role="tabpanel">
        {tab === "posts" ? (
          postsQuery.isLoading ? (
            <Rows />
          ) : posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} variant="timeline" />)
          ) : (
            <TimelineEmpty title={isSelf ? "You haven’t posted yet" : "No posts yet"} body={isSelf ? "Join a discussion room and add your voice." : `When @${profile.username} posts, it’ll show up here.`} href={isSelf ? "/discourse" : undefined} action={isSelf ? "Browse rooms" : undefined} />
          )
        ) : null}

        {tab === "likes" ? (
          likesQuery.isLoading ? <Rows /> : liked.length ? liked.map((post) => <PostCard key={post.id} post={post} variant="timeline" />) : <TimelineEmpty title="No likes yet" body="Posts they like will show up here." />
        ) : null}

        {tab === "media" ? (
          mediaQuery.isLoading ? (
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-none" />
              ))}
            </div>
          ) : media.length ? (
            <div className="grid grid-cols-3 gap-0.5">
              {media.map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-square overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={item.type === "video" ? "Open video" : "Open photo"}
                >
                  {item.type === "video" ? (
                    <span className="grid h-full place-items-center bg-[#0F1419] text-white">
                      <AppIcon icon={Video01Icon} size={28} />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="size-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <TimelineEmpty title="No photos or videos yet" body="Media from their posts will show up here." />
          )
        ) : null}

        {tab === "comments" ? (
          commentsQuery.isLoading ? (
            <Rows />
          ) : items(commentsQuery.data?.items).length ? (
            items(commentsQuery.data?.items).map((comment) => {
              const post = comment.posts as ApiRecord | undefined;
              return (
                <Link
                  key={String(comment.id)}
                  href={post?.id ? `/threads/post/${post.id}#comments` : "#"}
                  className="block border-b px-4 py-3 transition-colors hover:bg-foreground/[0.02]"
                >
                  <p className="text-[13px] text-muted-foreground">
                    Replied {comment.createdAt ? formatRelativeTime(String(comment.createdAt)) : ""}
                  </p>
                  <p className="mt-0.5 text-[15px] leading-5">{String(comment.message ?? "")}</p>
                  {post?.message ? (
                    <p className="mt-2 line-clamp-2 rounded-lg border px-3 py-2 text-[14px] text-muted-foreground">{String(post.message)}</p>
                  ) : null}
                </Link>
              );
            })
          ) : (
            <TimelineEmpty title="No replies yet" body="Replies to posts will show up here." />
          )
        ) : null}

        {tab === "votes" ? (
          votesQuery.isLoading ? (
            <Rows />
          ) : items(votesQuery.data?.items).length ? (
            items(votesQuery.data?.items).map((vote) => {
              const poll = vote.poll as ApiRecord | null | undefined;
              const election = vote.election as ApiRecord | null | undefined;
              const isPoll = String(vote.targetType) === "POLL";
              const href = isPoll && poll?.id ? `/polls/${poll.id}` : election?.id ? `/elections/${election.id}` : null;
              const title = isPoll ? String(poll?.question ?? "A poll") : String(election?.title ?? "An election");
              const body = (
                <>
                  <p className="text-[13px] text-muted-foreground">
                    Voted in {isPoll ? "a poll" : "a mock election"}
                    {vote.createdAt ? ` · ${formatRelativeTime(String(vote.createdAt))}` : ""}
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium leading-5">{title}</p>
                </>
              );
              return href ? (
                <Link key={String(vote.id)} href={href} className="block border-b px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
                  {body}
                </Link>
              ) : (
                <div key={String(vote.id)} className="border-b px-4 py-3">
                  {body}
                </div>
              );
            })
          ) : (
            <TimelineEmpty title="No votes yet" body="Polls and mock elections they vote in will show up here." />
          )
        ) : null}

        {tab === "issues" ? (
          issuesQuery.isLoading ? (
            <Rows />
          ) : items(issuesQuery.data?.items).length ? (
            items(issuesQuery.data?.items).map((record) => {
              const issue = normalizeIssue(record);
              return <IssueCard key={issue.id} issue={issue} />;
            })
          ) : (
            <TimelineEmpty title="No issues reported" body="Issues they report will show up here." href={isSelf ? "/issues/create" : undefined} action={isSelf ? "Report an issue" : undefined} />
          )
        ) : null}
      </div>

      {lightboxIndex != null && media.length ? (
        <MediaLightbox items={media} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
      ) : null}

      {isSelf && sessionUser ? (
        <ProfileEditModal
          open={editOpen}
          user={{ ...sessionUser, ...profile }}
          loading={update.isPending}
          onClose={() => setEditOpen(false)}
          onSubmit={(payload) => update.mutate(payload)}
        />
      ) : null}
    </>
  );
}
