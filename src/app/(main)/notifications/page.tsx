"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { TimelineEmpty, TimelineError, TimelineHeader, type TimelineTab } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { asArray, formatRelativeTime } from "@/lib/content-utils";
import { Alert02Icon, Comment01Icon, Message01Icon, Notification03Icon, SecurityCheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { notificationsService } from "@/services/notifications.service";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";
import type { ApiRecord } from "@/types";
import type { IconSvgElement } from "@hugeicons/react";

const PAGE = 20;
type TabId = "all" | "unread";
const TABS: TimelineTab<TabId>[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" }
];

type Sender = { username?: string; firstName?: string; lastName?: string; profilePic?: string } | null;

/** Where a notification leads, and how it's marked, from its data payload. */
function describe(item: ApiRecord): { href: string | null; icon: IconSvgElement; tone: string } {
  const data = (item.data && typeof item.data === "object" ? item.data : {}) as Record<string, unknown>;
  if (data.type === "tos_violation") return { href: null, icon: Alert02Icon, tone: "text-destructive" };
  if (data.postId && data.commentId) return { href: `/threads/post/${data.postId}#comments`, icon: Comment01Icon, tone: "text-primary" };
  if (data.postId) return { href: `/threads/post/${data.postId}`, icon: Comment01Icon, tone: "text-primary" };
  if (data.discussionsId) return { href: `/discussions/${data.discussionsId}`, icon: Message01Icon, tone: "text-sky-500" };
  if (/verif|password/i.test(String(item.message ?? ""))) return { href: "/settings", icon: SecurityCheckIcon, tone: "text-primary" };
  return { href: null, icon: Notification03Icon, tone: "text-muted-foreground" };
}

function RowSkeleton() {
  return (
    <div className="flex gap-3 border-b px-4 py-3" aria-hidden>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const openLoginModal = useLoginModalStore((state) => state.open);
  const [tab, setTab] = useState<TabId>("all");
  const [readLocally, setReadLocally] = useState<Set<string>>(new Set());

  const query = useInfiniteQuery({
    queryKey: ["notifications", "mine", user?.id ?? null],
    queryFn: async ({ pageParam }) => asArray<ApiRecord>(await notificationsService.mine({ skip: pageParam, take: PAGE })),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.length === PAGE ? pages.length * PAGE : undefined),
    enabled: Boolean(user?.id)
  });
  const all = query.data?.pages.flat() ?? [];
  const isRead = (item: ApiRecord) => Boolean(item.isRead) || readLocally.has(String(item.id));
  const items = tab === "unread" ? all.filter((item) => !isRead(item)) : all;
  const unread = all.filter((item) => !isRead(item)).length;

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
  }, [query]);
  const sentinelRef = useInfiniteScroll(loadMore, Boolean(query.hasNextPage));

  const refreshCount = () => queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });

  const readAll = useMutation({
    mutationFn: () => notificationsService.readAll(),
    onMutate: () => setReadLocally(new Set(all.map((item) => String(item.id)))),
    onSuccess: refreshCount,
    onError: () => {
      setReadLocally(new Set());
      gooeyToast.error("Couldn’t mark notifications as read");
    }
  });

  function open(item: ApiRecord) {
    const id = String(item.id);
    if (!isRead(item)) {
      setReadLocally((current) => new Set(current).add(id));
      void notificationsService.markRead(id).then(refreshCount).catch(() => undefined);
    }
    const { href } = describe(item);
    if (href) router.push(href);
  }

  if (!user) {
    return (
      <>
        <TimelineHeader title="Notifications" tabs={TABS.slice(0, 1)} active="all" onSelect={() => undefined} />
        <div className="mx-auto max-w-[400px] px-8 py-12">
          <p className="text-[22px] font-bold leading-7 sm:text-[28px] sm:leading-9 tracking-tight">Stay in the loop</p>
          <p className="mt-2 text-[15px] leading-5 text-muted-foreground">
            Sign in to see replies to your posts, updates on issues you follow and activity in your rooms.
          </p>
          <Button size="lg" className="mt-7" onClick={() => openLoginModal("Sign in to see your notifications.")}>
            Sign in
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <TimelineHeader title="Notifications" tabs={TABS} active={tab} onSelect={setTab} />
      {unread > 0 ? (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <p className="text-[14px] text-muted-foreground">
            {unread} unread{query.hasNextPage ? "+" : ""}
          </p>
          <Button variant="ghost" size="sm" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
            Mark all read
          </Button>
        </div>
      ) : null}

      <div role="tabpanel" aria-busy={query.isLoading}>
        {query.isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <RowSkeleton key={index} />)
        ) : query.isError ? (
          <TimelineError onRetry={() => query.refetch()} what="notifications" />
        ) : items.length ? (
          items.map((item) => {
            const { href, icon, tone } = describe(item);
            const sender = (item.sender ?? null) as Sender;
            const read = isRead(item);
            const name = sender ? [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.username : null;
            return (
              <button
                key={String(item.id)}
                type="button"
                onClick={() => open(item)}
                className={cn(
                  "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none",
                  !read && "bg-primary/[0.04]",
                  !href && "cursor-default"
                )}
              >
                <span className={cn("mt-0.5 shrink-0", tone)} aria-hidden>
                  <AppIcon icon={icon} size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  {sender?.profilePic ? (
                    <Image src={sender.profilePic} alt="" width={32} height={32} className="mb-1.5 size-8 rounded-full object-cover" />
                  ) : null}
                  <span className="block text-[15px] leading-5">
                    {name ? <span className="font-bold">{name} </span> : null}
                    {/* The API writes "ada commented…"; show the full name instead of the handle. */}
                    {name && sender?.username && String(item.message ?? "").startsWith(sender.username)
                      ? String(item.message).slice(sender.username.length).trimStart()
                      : String(item.message ?? "")}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                </span>
                {!read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
              </button>
            );
          })
        ) : tab === "unread" ? (
          <TimelineEmpty title="You’re all caught up" body="No unread notifications." />
        ) : (
          <TimelineEmpty
            title="Nothing yet"
            body="When people reply to your posts or things change in your rooms, you’ll see it here."
            href="/discourse"
            action="Join a discussion"
          />
        )}
        {query.isFetchingNextPage ? <RowSkeleton /> : null}
        <div ref={sentinelRef} className="h-1" aria-hidden />
      </div>
    </>
  );
}
