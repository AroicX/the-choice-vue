"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { IssueCard } from "@/components/cards/issue-card";
import { PollCard } from "@/components/cards/poll-card";
import { DetailSkeleton, IssueCardSkeleton, PollCardSkeleton, PostCardSkeleton } from "@/components/skeletons/card-skeletons";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  Add01Icon,
  AiMagicIcon,
  ArrowLeft01Icon,
  Attachment01Icon,
  CheckmarkBadge01Icon,
  Comment01Icon,
  FavouriteIcon,
  FireIcon,
  SecurityCheckIcon,
  SentIcon,
  Share08Icon
} from "@/lib/icons";
import {
  asArray,
  displayName,
  formatRelativeTime,
  isRoomMember,
  normalizeIssue,
  normalizePoll,
  normalizePost,
  recordId,
  userDisplayName,
  userInitials
} from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { api, getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { postsService } from "@/services/posts.service";
import { civicQueries } from "@/services/queries/civic.queries";
import { userQueries } from "@/services/queries/user.queries";
import { useAuthStore } from "@/stores/auth-store";
import { useCommentModalStore } from "@/stores/comment-modal-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord, Post, RoomRecord } from "@/types";

type RoomTab = "Posts" | "Polls" | "Issues" | "Top voices";

const tabs: RoomTab[] = ["Posts", "Polls", "Issues", "Top voices"];

function memberCount(record: ApiRecord) {
  return Number(record.memberCount ?? record.members ?? record.roomsCount ?? asArray(record.rooms).length ?? 0);
}

function formatMembers(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, "")}k members`;
  return `${count.toLocaleString()} members`;
}

function postInitials(post: Post) {
  if (post.user) return userInitials(post.user);
  return post.author.slice(0, 2).toUpperCase();
}

function postAuthorName(post: Post) {
  if (post.user) return userDisplayName(post.user);
  return post.author;
}

function isVerified(post: Post) {
  return Boolean(post.user?.verified || post.user?.verifiedPhone || /verified/i.test(post.badge ?? ""));
}

function isFactChecked(post: Post) {
  return /fact.?check/i.test(post.badge ?? "");
}

function aiSummary(raw: ApiRecord) {
  const summary = raw.aiSummary ?? raw.summary ?? raw.ai_summary;
  return summary ? String(summary) : null;
}

function attachmentCount(raw: ApiRecord) {
  const attachments = raw.attachments;
  if (Array.isArray(attachments)) return attachments.length;
  if (attachments && typeof attachments === "object") return Object.keys(attachments).length;
  return Number(raw.attachmentCount ?? 0);
}

function RoomPostCard({
  post,
  raw,
  isMember,
  onRequireJoin
}: {
  post: Post;
  raw: ApiRecord;
  isMember: boolean;
  onRequireJoin: () => void;
}) {
  const { requireAuth } = useRequireAuth();
  const openCommentModal = useCommentModalStore((state) => state.open);
  const openShareModal = useShareModalStore((state) => state.open);
  const { likes, react, isPending, isLiked } = usePostReaction(post);
  const commentCount = post._count?.comments ?? post.comments;
  const summary = aiSummary(raw);
  const files = attachmentCount(raw);
  const verified = isVerified(post);
  const factChecked = isFactChecked(post);

  function guardMemberAction(message: string, action: () => void) {
    if (!requireAuth(message)) return;
    if (!isMember) {
      onRequireJoin();
      return;
    }
    action();
  }

  function sharePost() {
    openShareModal({
      type: "post",
      url: `${window.location.origin}/threads/post/${post.id}`,
      author: postAuthorName(post),
      handle: post.handle,
      message: post.message,
      topic: post.topic
    });
  }

  return (
    <article className="rounded-xl border border-border/80 bg-card p-3.5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {post.user?.profilePic ? (
          <Image src={post.user.profilePic} alt={postAuthorName(post)} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            {postInitials(post)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {postAuthorName(post)}
            {post.createdAt ? <span className="font-normal text-muted-foreground"> · {formatRelativeTime(post.createdAt)}</span> : null}
          </p>
        </div>
        {factChecked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            <AppIcon icon={SecurityCheckIcon} size={10} />
            Fact-checked
          </span>
        ) : verified ? (
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            Verified
          </span>
        ) : null}
      </div>

      <p className="text-[13px] leading-relaxed text-foreground">{post.message}</p>

      {summary ? (
        <div className="mt-2 rounded-r-lg border-l-2 border-lime-400 bg-slate-50 px-2.5 py-1.5 dark:bg-slate-900/50">
          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-lime-800 dark:text-lime-300">
            <AppIcon icon={AiMagicIcon} size={11} />
            AI summary
          </p>
          <p className="text-[11px] text-lime-700 dark:text-lime-400">{summary}</p>
        </div>
      ) : null}

      {isMember ? (
        <div className="mt-2 flex items-center gap-3.5 text-[11px] text-muted-foreground">
          <button
            type="button"
            className={cn("inline-flex items-center gap-1 transition-colors hover:text-primary", isLiked && "text-primary")}
            disabled={isPending}
            onClick={() => guardMemberAction("Sign in to react to posts.", () => react("like"))}
          >
            <AppIcon icon={FavouriteIcon} size={13} />
            {likes}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
            onClick={() => guardMemberAction("Sign in to comment on this post.", () => openCommentModal(post))}
          >
            <AppIcon icon={Comment01Icon} size={13} />
            {commentCount}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
            onClick={() => guardMemberAction("Sign in to share this post.", sharePost)}
          >
            <AppIcon icon={Share08Icon} size={13} />
          </button>
          {files > 0 ? (
            <span className="inline-flex items-center gap-1">
              <AppIcon icon={Attachment01Icon} size={13} />
              {files} file{files === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-3.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <AppIcon icon={FavouriteIcon} size={13} />
            {likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <AppIcon icon={Comment01Icon} size={13} />
            {commentCount}
          </span>
          {files > 0 ? (
            <span className="inline-flex items-center gap-1">
              <AppIcon icon={Attachment01Icon} size={13} />
              {files} file{files === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}

function TopVoiceCard({
  author,
  posts,
  likes
}: {
  author: string;
  posts: number;
  likes: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {author.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{author}</p>
        <p className="text-xs text-muted-foreground">
          {posts} post{posts === 1 ? "" : "s"} · {likes.toLocaleString()} likes
        </p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
        <AppIcon icon={CheckmarkBadge01Icon} size={12} />
        Top voice
      </span>
    </div>
  );
}

export function DiscourseRoomView({ discussionId }: { discussionId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [tab, setTab] = useState<RoomTab>("Posts");
  const [optimisticJoined, setOptimisticJoined] = useState(false);
  const [draft, setDraft] = useState("");

  const query = useQuery({
    queryKey: ["detail", endpoints.discussions.detail(discussionId)],
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

  const issuesQuery = useQuery({
    queryKey: ["discussion-issues", id],
    queryFn: civicQueries.issues,
    enabled: tab === "Issues",
    retry: false
  });

  const rooms = asArray<RoomRecord>(roomsQuery.data);
  const isMember = optimisticJoined || isRoomMember(rooms, id);

  const rawPosts = asArray<ApiRecord>(postsQuery.data);
  const posts = rawPosts.map((raw) => ({ raw, post: normalizePost(raw, user?.id) }));
  const polls = asArray<ApiRecord>(pollsQuery.data).map(normalizePoll);

  const category = String(record?.category ?? record?.topic ?? record?.type ?? "Discussion");
  const members = record ? memberCount(record) : 0;
  const trending = Boolean(record?.trending) || members >= 100 || posts.length >= 5;

  const issues = useMemo(() => {
    const all = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);
    const term = category.toLowerCase();
    const matched = all.filter((issue) => issue.category.toLowerCase().includes(term) || issue.title.toLowerCase().includes(term));
    return (matched.length ? matched : all).slice(0, 8);
  }, [category, issuesQuery.data]);

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
    mutationFn: async (message: string) =>
      postsService.create({
        discussionsId: id,
        message,
        attachments: {}
      }),
    onSuccess: () => {
      setDraft("");
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
    if (!message) return;
    if (!requireAuth("Sign in to add to the discussion.")) return;
    if (!isMember) {
      gooeyToast.info("Join the discussion to post.");
      return;
    }
    createPostMutation.mutate(message);
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <DetailSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (query.error || !record) {
    return (
      <Card>
        <CardContent className="p-5 text-destructive">{query.error?.message ?? "Discussion not found."}</CardContent>
      </Card>
    );
  }

  return (
    <div className="-mx-4 flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-none border-y border-border/80 bg-slate-50 dark:bg-background sm:-mx-6 sm:rounded-2xl sm:border lg:-mx-8">
      <header className="border-b border-border/80 bg-card px-4 py-3">
        <div className="mb-0.5 flex items-center gap-2.5">
          <Link href="/discourse" className="text-foreground transition-colors hover:text-primary" aria-label="Back to discourse">
            <AppIcon icon={ArrowLeft01Icon} size={18} />
          </Link>
          <h1 className="truncate text-[15px] font-medium text-foreground">{displayName(record)}</h1>
        </div>
        <div className="ml-7 flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
          <span>{category}</span>
          <span>·</span>
          <span>{formatMembers(members)}</span>
          {trending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <AppIcon icon={FireIcon} size={10} />
              Trending
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-border/80 bg-card px-4 pt-2.5">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "whitespace-nowrap pb-2 text-xs transition-colors",
                tab === item
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        {!isMember ? (
          <Button className="w-full gap-1.5" onClick={handleJoin} disabled={joinMutation.isPending}>
            <AppIcon icon={Add01Icon} size={15} />
            {joinMutation.isPending ? "Joining..." : "Join the discussion"}
          </Button>
        ) : null}

        {tab === "Posts" ? (
          postsQuery.isLoading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : posts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No posts in this discussion yet.</p>
          ) : (
            posts.map(({ raw, post }) => (
              <RoomPostCard key={post.id} post={post} raw={raw} isMember={isMember} onRequireJoin={requireJoin} />
            ))
          )
        ) : null}

        {tab === "Polls" ? (
          pollsQuery.isLoading ? (
            <>
              <PollCardSkeleton />
              <PollCardSkeleton />
            </>
          ) : polls.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No polls in this discussion yet.</p>
          ) : (
            <div className="space-y-3">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )
        ) : null}

        {tab === "Issues" ? (
          issuesQuery.isLoading ? (
            <>
              <IssueCardSkeleton />
              <IssueCardSkeleton />
            </>
          ) : issues.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No related issues yet.</p>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )
        ) : null}

        {tab === "Top voices" ? (
          topVoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Top voices will appear as people post.</p>
          ) : (
            <div className="space-y-3">
              {topVoices.map((voice) => (
                <TopVoiceCard key={voice.author} {...voice} />
              ))}
            </div>
          )
        ) : null}
      </div>

      {tab === "Posts" && isMember ? (
        <form onSubmit={handleCompose} className="flex items-center gap-2.5 border-t border-border/80 bg-card px-4 py-2.5">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add to the discussion"
            className="h-9 flex-1 rounded-full bg-slate-50 text-xs dark:bg-muted/40"
            disabled={createPostMutation.isPending}
          />
          <button
            type="submit"
            disabled={createPostMutation.isPending || !draft.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
            aria-label="Send post"
          >
            <AppIcon icon={SentIcon} size={15} />
          </button>
        </form>
      ) : null}

      {tab === "Posts" && !isMember ? (
        <div className="border-t border-border/80 bg-card px-4 py-3 text-center text-xs text-muted-foreground">
          Join the discussion to post, like, comment, or share.
        </div>
      ) : null}
    </div>
  );
}
