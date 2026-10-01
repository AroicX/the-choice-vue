"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { PollCard } from "@/components/cards/poll-card";
import { PostCard } from "@/components/cards/post-card";
import { RoomCover } from "@/components/discourse/room-cover";
import { RoomCoverEditor } from "@/components/discourse/room-cover-editor";
import { MediaAttachmentPicker, readyMediaAttachments, type PendingMedia } from "@/components/media/media-attachment-picker";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ArrowLeft01Icon } from "@/lib/icons";
import { asArray, displayName, isRoomMember, normalizePoll, normalizePost, recordId, userDisplayName, userInitials } from "@/lib/content-utils";
import { toAttachmentsPayload } from "@/lib/media-utils";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { postsService } from "@/services/posts.service";
import { userQueries } from "@/services/queries/user.queries";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, MediaAttachment, Post, RoomRecord } from "@/types";

type RoomTab = "posts" | "polls" | "voices";

const TABS: TimelineTab<RoomTab>[] = [
  { id: "posts", label: "Posts" },
  { id: "polls", label: "Polls" },
  { id: "voices", label: "Top voices" }
];

function plural(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

function aiSummary(raw: ApiRecord) {
  const summary = raw.aiSummary ?? raw.summary ?? raw.ai_summary;
  return summary ? String(summary) : null;
}

function postAuthorName(post: Post) {
  return post.user ? userDisplayName(post.user) : post.author;
}

function TopVoiceRow({ rank, author, posts, likes }: { rank: number; author: string; posts: number; likes: number }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <span className="w-5 text-center text-[15px] font-bold tabular-nums text-muted-foreground">{rank}</span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
        {author.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{author}</span>
        <span className="block text-[13px] text-muted-foreground">
          {plural(posts, "post")} · {plural(likes, "like")}
        </span>
      </span>
    </div>
  );
}

export function DiscourseRoomView({ discussionId }: { discussionId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [tab, setTab] = useState<RoomTab>("posts");
  const [optimisticJoined, setOptimisticJoined] = useState(false);
  const [draft, setDraft] = useState("");
  const [media, setMedia] = useState<PendingMedia[]>([]);

  const detailKey = ["detail", endpoints.discussions.detail(discussionId)] as const;
  const query = useQuery({
    queryKey: detailKey,
    queryFn: () => getData<ApiRecord>(endpoints.discussions.detail(discussionId)),
    retry: false
  });

  const record = query.data;
  const id = record ? recordId(record) : discussionId;

  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: isAuthenticated,
    retry: false
  });

  const postsQuery = useQuery({
    queryKey: ["discussion-posts", id],
    queryFn: () => getData<unknown>(endpoints.posts.byDiscussion(id)),
    enabled: Boolean(id),
    retry: false
  });

  const pollsQuery = useQuery({
    queryKey: ["discussion-polls", id],
    queryFn: () => getData<unknown>(endpoints.polls.byDiscussion(id)),
    enabled: Boolean(id),
    retry: false
  });

  const rooms = asArray<RoomRecord>(roomsQuery.data);
  const isMember = optimisticJoined || isRoomMember(rooms, id);

  const rawPosts = asArray<ApiRecord>(postsQuery.data);
  const posts = rawPosts.map((raw) => ({ raw, post: normalizePost(raw, user?.id) }));
  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll);

  const counts = ((record?._count ?? {}) as { rooms?: number; posts?: number; polls?: number });
  const members = Number(counts.rooms ?? 0) + (optimisticJoined && !isRoomMember(rooms, id) ? 1 : 0);

  const topVoices = useMemo(() => {
    const map = new Map<string, { author: string; posts: number; likes: number }>();
    for (const { post } of posts) {
      const key = post.user?.id ?? post.author;
      const current = map.get(key) ?? { author: postAuthorName(post), posts: 0, likes: 0 };
      current.posts += 1;
      current.likes += post.likes;
      map.set(key, current);
    }
    return Array.from(map.values())
      .sort((a, b) => b.likes - a.likes || b.posts - a.posts)
      .slice(0, 8);
  }, [posts]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sign in required");
      return api.post(endpoints.rooms.join, { discussionsId: id, userId: user.id });
    },
    onMutate: async () => {
      const previous = optimisticJoined;
      setOptimisticJoined(true);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      setOptimisticJoined(context?.previous ?? false);
      gooeyToast.error("Could not join room");
    },
    onSuccess: () => {
      gooeyToast.success("Joined discussion");
      queryClient.invalidateQueries({ queryKey: ["rooms", "me"] });
      queryClient.invalidateQueries({ queryKey: ["profile-rooms"] });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ message, attachments }: { message: string; attachments: MediaAttachment[] }) =>
      postsService.create({
        discussionsId: id,
        message,
        attachments: toAttachmentsPayload(attachments)
      }),
    onSuccess: () => {
      setDraft("");
      setMedia([]);
      gooeyToast.success("Posted to discussion");
      queryClient.invalidateQueries({ queryKey: ["discussion-posts", id] });
    },
    onError: (error) => {
      gooeyToast.error("Could not post", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  function handleJoin() {
    if (!requireAuth("Sign in to join this discussion room.")) return;
    joinMutation.mutate();
  }

  function requireJoin() {
    gooeyToast.info("Join the discussion to like, comment, or share.");
  }

  function handleCompose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    const attachments = readyMediaAttachments(media);
    if (!message && !attachments.length) return;
    if (!requireAuth("Sign in to add to the discussion.")) return;
    if (!isMember) {
      gooeyToast.info("Join the discussion to post.");
      return;
    }
    if (media.some((item) => item.uploading)) {
      gooeyToast.info("Wait for media uploads to finish.");
      return;
    }
    createPostMutation.mutate({ message: message || " ", attachments });
  }

  if (query.isLoading) {
    return (
      <div aria-busy>
        <div className="flex h-[53px] items-center gap-4 border-b px-4">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3 border-b p-4">
          <Skeleton className="size-14 rounded-2xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <PostRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (query.error || !record) {
    return (
      <TimelineEmpty
        title="Room not found"
        body="It may have been removed, or the link is wrong."
        href="/discourse"
        action="Back to Discourse"
      />
    );
  }

  const title = displayName(record);
  const coverImage = record.coverImage ? String(record.coverImage) : null;
  const canEditCover = Boolean(
    user && (user.id === record.createdById || user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  );
  const question = record.question ? String(record.question) : "";
  const description = record.description ? String(record.description) : "";

  return (
    <>
      <div className="sticky top-[53px] z-30 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <Link
          href="/discourse"
          aria-label="Back to Discourse"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold leading-5">{title}</p>
          <p className="text-[13px] text-muted-foreground">{plural(members, "member")}</p>
        </div>
      </div>

      <div className="relative">
        <RoomCover seed={id} text={`${title} ${question}`} src={coverImage} className="aspect-[3/1] w-full" />
        {canEditCover ? <RoomCoverEditor discussionId={id} hasCover={Boolean(coverImage)} detailQueryKey={detailKey} /> : null}
      </div>

      <section className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="pt-1 text-xl font-bold leading-6 tracking-tight">{title}</h1>
          {isMember ? (
            <span className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium">Joined</span>
          ) : (
            <Button variant="inverted" onClick={handleJoin} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? "Joining…" : "Join"}
            </Button>
          )}
        </div>
        {question && question !== title ? <p className="mt-2 text-[15px] font-medium leading-5">{question}</p> : null}
        {description ? <p className="mt-1.5 line-clamp-3 text-[15px] leading-5 text-muted-foreground">{description}</p> : null}
        <p className="mt-3 flex flex-wrap gap-x-4 text-[13px] text-muted-foreground">
          <span>
            <strong className="font-bold text-foreground">{members.toLocaleString()}</strong> {members === 1 ? "member" : "members"}
          </span>
          <span>
            <strong className="font-bold text-foreground">{Number(counts.posts ?? posts.length).toLocaleString()}</strong>{" "}
            {Number(counts.posts ?? posts.length) === 1 ? "post" : "posts"}
          </span>
          <span>
            <strong className="font-bold text-foreground">{Number(counts.polls ?? polls.length).toLocaleString()}</strong>{" "}
            {Number(counts.polls ?? polls.length) === 1 ? "poll" : "polls"}
          </span>
        </p>
      </section>

      <TimelineHeader tabs={TABS} active={tab} onSelect={setTab} className="static border-t" />

      {tab === "posts" ? (
        isMember ? (
          <form onSubmit={handleCompose} className="flex gap-3 border-b px-4 py-3">
            {user?.profilePic ? (
              <Image src={user.profilePic} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
                {user ? userInitials(user) : "?"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <label htmlFor="room-composer" className="sr-only">
                Add to the discussion
              </label>
              <textarea
                id="room-composer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Add to the discussion"
                rows={2}
                disabled={createPostMutation.isPending}
                className="block w-full resize-none bg-transparent py-2 text-[17px] leading-6 placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-start justify-between gap-3 border-t pt-2">
                <MediaAttachmentPicker items={media} onChange={setMedia} disabled={createPostMutation.isPending} compact className="flex-1" />
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    createPostMutation.isPending ||
                    media.some((item) => item.uploading) ||
                    (!draft.trim() && !readyMediaAttachments(media).length)
                  }
                >
                  {createPostMutation.isPending ? "Posting…" : "Post"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
            <p className="text-[15px] text-muted-foreground">Join this room to post, like and comment.</p>
            <Button size="sm" variant="outline" onClick={handleJoin} disabled={joinMutation.isPending}>
              Join
            </Button>
          </div>
        )
      ) : null}

      <div role="tabpanel">
        {tab === "posts" ? (
          postsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <PostRowSkeleton key={index} />)
          ) : postsQuery.isError ? (
            <TimelineError onRetry={() => postsQuery.refetch()} />
          ) : posts.length ? (
            posts.map(({ raw, post }) => (
              <PostCard
                key={post.id}
                post={post}
                variant="timeline"
                hideTopic
                summary={aiSummary(raw)}
                guard={() => {
                  if (isMember) return true;
                  requireJoin();
                  return false;
                }}
              />
            ))
          ) : (
            <TimelineEmpty
              title="No posts yet"
              body={isMember ? "Start the conversation — you’ll be the first to post." : "Join the room and start the conversation."}
            />
          )
        ) : null}

        {tab === "polls" ? (
          pollsQuery.isLoading ? (
            Array.from({ length: 2 }).map((_, index) => <PostRowSkeleton key={index} />)
          ) : polls.length ? (
            <div className="space-y-3 p-4">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <TimelineEmpty title="No polls yet" body="Polls created in this room will show up here." />
          )
        ) : null}

        {tab === "voices" ? (
          topVoices.length ? (
            topVoices.map((voice, index) => <TopVoiceRow key={voice.author} rank={index + 1} {...voice} />)
          ) : (
            <TimelineEmpty title="No top voices yet" body="The most-liked contributors will show up here as people post." />
          )
        ) : null}
      </div>
    </>
  );
}
