"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { mainNav, mobileNav } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { civicQueries } from "@/services/queries/civic.queries";
import { notificationsService } from "@/services/notifications.service";
import { userQueries } from "@/services/queries/user.queries";
import {
  asArray,
  normalizeIssue,
  normalizePolitician,
  normalizePoll,
  userDisplayName,
  userInitials
} from "@/lib/content-utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";
import { Add01Icon, Logout01Icon, Search01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ApiRecord, RoomRecord, User } from "@/types";

/**
 * Routes that render as a single ~660px timeline column, X-style. Everything
 * else (grids, dashboards, detail pages) gets the wider fluid column so its
 * multi-column layouts keep their room.
 */
const TIMELINE_ROUTES = ["/home", "/feed", "/discourse", "/discussions", "/polls", "/issues", "/notifications", "/threads"];

function isTimelineRoute(pathname: string) {
  return TIMELINE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function unreadCountFromPayload(payload: unknown): number {
  if (typeof payload === "number") return Math.max(0, payload);
  if (typeof payload === "string") {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  if (!payload || typeof payload !== "object") return 0;
  const record = payload as Record<string, unknown>;
  const candidates = [record.count, record.unreadCount, record.unread, record.total];
  for (const value of candidates) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return 0;
}

function NotificationBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-[18px] text-primary-foreground ring-2 ring-background",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  if (user.profilePic) {
    return (
      <Image
        src={user.profilePic}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-foreground"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {userInitials(user)}
    </span>
  );
}

/** One row in a right-sidebar widget: X's "What's happening" list item. */
function WidgetRow({ href, meta, title, detail }: { href: string; meta?: string; title: string; detail?: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03] focus-visible:outline-none"
    >
      {meta ? <p className="truncate text-[13px] text-muted-foreground">{meta}</p> : null}
      <p className="line-clamp-2 text-[15px] font-bold leading-5">{title}</p>
      {detail ? <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{detail}</p> : null}
    </Link>
  );
}

function Widget({
  title,
  moreHref,
  isLoading,
  children
}: {
  title: string;
  moreHref?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <h2 className="px-4 pb-1 pt-3 text-xl font-extrabold tracking-tight">{title}</h2>
      {isLoading ? (
        <div className="space-y-4 px-4 py-3" aria-busy>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        children
      )}
      {moreHref && !isLoading ? (
        <Link
          href={moreHref}
          className="block px-4 py-3 text-[15px] text-primary transition-colors hover:bg-foreground/[0.03]"
        >
          Show more
        </Link>
      ) : null}
    </section>
  );
}

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const openLoginModal = useLoginModalStore((state) => state.open);
  const [search, setSearch] = useState("");
  const timeline = isTimelineRoute(pathname);

  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: isAuthenticated,
    retry: false
  });
  const issuesQuery = useQuery({ queryKey: ["shell", "issues"], queryFn: civicQueries.issues });
  const politiciansQuery = useQuery({ queryKey: ["shell", "politicians"], queryFn: civicQueries.politicians });
  const pollsQuery = useQuery({ queryKey: ["shell", "polls"], queryFn: civicQueries.polls });
  const notificationCountQuery = useQuery({
    queryKey: ["notifications", "count", user?.id],
    queryFn: () => notificationsService.count(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000
  });

  const joinedRooms = asArray<RoomRecord>(roomsQuery.data).slice(0, 4);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue).slice(0, 4);
  const politicians = asArray(politiciansQuery.data).map(normalizePolitician).slice(0, 3);
  const poll = asArray(pollsQuery.data).map(normalizePoll)[0];
  const unreadCount = unreadCountFromPayload(notificationCountQuery.data);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  function reportIssue() {
    if (requireAuth("Sign in to report a civic issue.")) router.push("/issues/create");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/politicians?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1440px] justify-center">
        {/* Left rail: icons only at lg, icons + labels from xl. */}
        <header className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col items-end px-3 lg:flex xl:w-[275px] xl:items-stretch">
          <div className="flex h-full w-fit flex-col xl:w-full">
            <Link
              href="/home"
              aria-label="Choice9ja home"
              className="mt-1 grid size-[52px] place-items-center rounded-full transition-colors hover:bg-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192x192.png" alt="" className="size-8 object-contain" />
            </Link>

            <nav aria-label="Main" className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ul className="space-y-0.5">
                {mainNav.map((item) => {
                  const active = isActive(pathname, item.href);
                  const badge = item.href === "/notifications" ? unreadCount : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={item.label}
                        className="group flex focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-5 rounded-full p-3 text-xl leading-6 transition-colors",
                            "group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-ring xl:pr-6",
                            active ? "font-bold" : "font-normal"
                          )}
                        >
                          <span className="relative">
                            <AppIcon icon={item.icon} size={26} strokeWidth={active ? 2.25 : 1.75} />
                            {badge > 0 ? (
                              <NotificationBadge count={badge} className="absolute -right-2 -top-1.5" />
                            ) : null}
                          </span>
                          <span className="hidden xl:inline">{item.label}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Button size="lg" className="my-4 hidden h-[52px] w-[90%] text-[17px] xl:flex" onClick={reportIssue}>
              Report an issue
            </Button>
            <Button size="icon" className="my-4 size-[52px] xl:hidden" onClick={reportIssue} aria-label="Report an issue">
              <AppIcon icon={Add01Icon} size={24} strokeWidth={2.25} />
            </Button>

            <div className="mb-3 flex items-center gap-1 xl:justify-between">
              {isAuthenticated && user ? (
                <Link
                  href="/profile"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-full p-3 transition-colors hover:bg-accent"
                >
                  <Avatar user={user} />
                  <span className="hidden min-w-0 xl:block">
                    <span className="block truncate text-[15px] font-bold leading-5">{userDisplayName(user)}</span>
                    <span className="block truncate text-[15px] leading-5 text-muted-foreground">@{user.username}</span>
                  </span>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="hidden flex-1 xl:flex"
                  onClick={() => openLoginModal("Sign in to continue.")}
                >
                  Sign in
                </Button>
              )}
              <div className="hidden xl:flex">
                <ThemeToggle />
                {isAuthenticated ? (
                  <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
                    <AppIcon icon={Logout01Icon} size={20} />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {/* Centre column. */}
        <div
          className={cn(
            "min-w-0 border-border lg:border-x",
            timeline ? "w-full max-w-[660px]" : "w-full max-w-[660px] flex-1 lg:max-w-[1080px]"
          )}
        >
          {/* Mobile top bar. */}
          <div className="sticky top-0 z-30 flex h-[53px] items-center justify-between border-b bg-background/85 px-4 backdrop-blur-md lg:hidden">
            {isAuthenticated && user ? (
              <Link href="/profile" aria-label="Your profile">
                <Avatar user={user} size={32} />
              </Link>
            ) : (
              <Button size="sm" variant="outline" onClick={() => openLoginModal("Sign in to continue.")}>
                Sign in
              </Button>
            )}
            <Link href="/home" aria-label="Choice9ja home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192x192.png" alt="" className="size-7 object-contain" />
            </Link>
            <ThemeToggle />
          </div>

          <main className={cn("min-w-0 pb-24 lg:pb-0", !timeline && "px-4 py-5 sm:px-6")}>{children}</main>
        </div>

        {/* Right sidebar: search and widgets, on every page from xl up. */}
        <aside className="sticky top-0 hidden h-screen w-[380px] shrink-0 overflow-y-auto pl-7 pr-2 xl:block">
          <div className="sticky top-0 z-10 bg-background pb-3 pt-1.5">
            <form role="search" onSubmit={handleSearch} className="relative">
              <AppIcon
                icon={Search01Icon}
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leaders"
                aria-label="Search leaders"
                className="h-11 w-full rounded-full border border-transparent bg-secondary pl-12 pr-4 text-[15px] placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </form>
          </div>

          <div className="space-y-4 pb-6">
            {!isAuthenticated ? (
              <section className="rounded-2xl border p-4">
                <h2 className="text-xl font-extrabold tracking-tight">New to Choice9ja?</h2>
                <p className="mt-1 text-[13px] leading-4 text-muted-foreground">
                  Rate your leaders, report local issues and join the conversation.
                </p>
                <Button asChild variant="inverted" className="mt-4 w-full">
                  <Link href="/register">Create account</Link>
                </Button>
                <Button variant="outline" className="mt-2 w-full" onClick={() => openLoginModal("Sign in to continue.")}>
                  Sign in
                </Button>
              </section>
            ) : null}

            {isAuthenticated ? (
              <Widget title="Your discussions" moreHref="/discourse" isLoading={roomsQuery.isLoading}>
                {joinedRooms.length ? (
                  joinedRooms.map((room) => {
                    const discussionId = room.discussionsId ?? room.discussions?.id ?? room.id;
                    const pollCount = asArray(room.discussions?.polls).length;
                    return (
                      <WidgetRow
                        key={room.id}
                        href={`/discussions/${discussionId}`}
                        meta="Discussion"
                        title={room.discussions?.topic ?? "Discussion room"}
                        detail={`${pollCount.toLocaleString()} poll${pollCount === 1 ? "" : "s"}`}
                      />
                    );
                  })
                ) : (
                  <p className="px-4 py-3 text-[15px] text-muted-foreground">
                    You haven’t joined a discussion yet.
                  </p>
                )}
              </Widget>
            ) : null}

            <Widget title="Trending issues" moreHref="/issues" isLoading={issuesQuery.isLoading}>
              {issues.length ? (
                issues.map((issue) => (
                  <WidgetRow
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    meta={[issue.category, issue.location].filter(Boolean).join(" · ")}
                    title={issue.title}
                    detail={`${issue.upvotes.toLocaleString()} upvote${issue.upvotes === 1 ? "" : "s"}`}
                  />
                ))
              ) : (
                <p className="px-4 py-3 text-[15px] text-muted-foreground">No issues reported yet.</p>
              )}
            </Widget>

            <Widget title="Leaders to watch" moreHref="/politicians" isLoading={politiciansQuery.isLoading}>
              {politicians.map((person) => (
                <Link
                  key={person.id}
                  href={`/politicians/${person.slug ?? person.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03]"
                >
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
                      {person.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold leading-5">{person.name}</span>
                    <span className="block truncate text-[13px] capitalize text-muted-foreground">
                      {person.position.toLowerCase()}
                    </span>
                  </span>
                  {/* A stored 0 means nobody has rated them, not 0% approval. */}
                  <span className="shrink-0 text-[13px] font-bold tabular-nums">
                    {person.approvalScore > 0 ? (
                      `${Math.round(person.approvalScore)}%`
                    ) : (
                      <span className="font-normal text-muted-foreground">Not rated</span>
                    )}
                  </span>
                </Link>
              ))}
            </Widget>

            {poll ? (
              <Widget title="Poll of the day">
                <WidgetRow
                  href={`/polls/${poll.id}`}
                  meta={`${poll.votes.toLocaleString()} vote${poll.votes === 1 ? "" : "s"}`}
                  title={poll.question}
                  detail="Tap to vote"
                />
              </Widget>
            ) : null}

            <nav aria-label="Footer" className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[13px] text-muted-foreground">
              <Link href="/news" className="hover:underline">News</Link>
              <Link href="/fact-checks" className="hover:underline">Fact checks</Link>
              <Link href="/communities" className="hover:underline">Communities</Link>
              <span>© {new Date().getFullYear()} Choice9ja</span>
            </nav>
          </div>
        </aside>
      </div>

      {/* Mobile: report button + tab bar. */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-40 size-14 shadow-panel lg:hidden"
        onClick={reportIssue}
        aria-label="Report an issue"
      >
        <AppIcon icon={Add01Icon} size={24} strokeWidth={2.25} />
      </Button>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.href === "/notifications" ? unreadCount : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className="flex h-[53px] items-center justify-center"
                >
                  <span className="relative">
                    <AppIcon
                      icon={item.icon}
                      size={26}
                      strokeWidth={active ? 2.25 : 1.75}
                      className={active ? "text-foreground" : "text-muted-foreground"}
                    />
                    {badge > 0 ? <NotificationBadge count={badge} className="absolute -right-2 -top-1.5" /> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
