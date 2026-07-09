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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SidebarWidgetSkeleton } from "@/components/skeletons/card-skeletons";
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
import { Logout01Icon, Message01Icon, Search01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ApiRecord, RoomRecord } from "@/types";

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
        "inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
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

  const roomsQuery = useQuery({
    queryKey: ["rooms", "me"],
    queryFn: userQueries.rooms,
    enabled: isAuthenticated,
    retry: false
  });
  const issuesQuery = useQuery({
    queryKey: ["shell", "issues"],
    queryFn: civicQueries.issues,
    enabled: !isAuthenticated
  });
  const politiciansQuery = useQuery({ queryKey: ["shell", "politicians"], queryFn: civicQueries.politicians });
  const pollsQuery = useQuery({ queryKey: ["shell", "polls"], queryFn: civicQueries.polls });
  const notificationCountQuery = useQuery({
    queryKey: ["notifications", "count", user?.id],
    queryFn: () => notificationsService.count(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000
  });

  const joinedRooms = asArray<RoomRecord>(roomsQuery.data).slice(0, 6);
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue).slice(0, 3);
  const politicians = asArray(politiciansQuery.data).map(normalizePolitician).slice(0, 4);
  const polls = asArray(pollsQuery.data).map(normalizePoll);
  const unreadCount = unreadCountFromPayload(notificationCountQuery.data);

  function handleLogout() {
    clearSession();
    document.cookie = "choice9ja-role=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/politicians?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_340px]">
        <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-card/70 px-4 py-5 backdrop-blur-xl lg:block">
          <Link href="/home" className="mb-8 flex items-center gap-3 font-bold">
            <img src="/legacy/logo.png" alt="Choice9ja" className="h-10 w-10 rounded-xl object-contain shadow-glow" />
            <span className="civic-gradient-text">TheChoice9ja</span>
          </Link>
          <nav className="space-y-1.5 overflow-y-auto pb-36">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const showBadge = item.href === "/notifications" && unreadCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-pill", active && "nav-pill-active", showBadge && "justify-between")}
                >
                  <span className="flex items-center gap-3">
                    <AppIcon icon={item.icon} size={18} />
                    {item.label}
                  </span>
                  {showBadge ? <NotificationBadge count={unreadCount} /> : null}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-5 left-4 right-4 space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                if (requireAuth("Sign in to report a civic issue.")) {
                  router.push("/issues/create");
                }
              }}
            >
              Create report
            </Button>
            {isAuthenticated ? (
              <Button variant="outline" className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                <AppIcon icon={Logout01Icon} size={16} />
                Log out
              </Button>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Link href="/home" className="flex shrink-0 items-center gap-2 font-bold lg:hidden">
                <img src="/legacy/logo.png" alt="Choice9ja" className="h-9 w-9 rounded-xl object-contain shadow-glow" />
                <span className="civic-gradient-text hidden sm:inline">TheChoice9ja</span>
              </Link>

              <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
                <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 pl-10"
                  placeholder="Search civic topics..."
                  aria-label="Search"
                />
              </form>

              <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                {isAuthenticated && user ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-card/70 px-2 py-1.5 transition-colors hover:bg-accent/60"
                  >
                    {user.profilePic ? (
                      <Image
                        src={user.profilePic}
                        alt={userDisplayName(user)}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {userInitials(user)}
                      </span>
                    )}
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm font-semibold leading-tight">{userDisplayName(user)}</span>
                      <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
                    </span>
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => openLoginModal("Sign in to continue.")}>
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
        </div>

        <aside className="sticky top-0 hidden h-screen overflow-y-auto border-l border-white/10 bg-card/50 px-5 py-6 backdrop-blur-xl xl:block">
          <div className="space-y-5">
            {isAuthenticated ? (
              roomsQuery.isLoading ? (
                <SidebarWidgetSkeleton />
              ) : (
                <Card className="glass-panel p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">Your discussions</h3>
                    <Link href="/discourse" className="text-xs font-medium text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="mt-3 space-y-3">
                    {joinedRooms.length ? (
                      joinedRooms.map((room) => {
                        const discussionId = room.discussionsId ?? room.discussions?.id ?? room.id;
                        const topic = room.discussions?.topic ?? "Discussion room";
                        const pollCount = asArray(room.discussions?.polls).length;
                        return (
                          <Link
                            href={`/discussions/${discussionId}`}
                            key={room.id}
                            className="flex items-start gap-3 rounded-xl border border-primary/10 bg-background/60 p-3 transition-colors hover:border-primary/25 hover:bg-accent/50"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <AppIcon icon={Message01Icon} size={16} />
                            </span>
                            <span className="min-w-0">
                              <p className="truncate text-sm font-medium">{topic}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {pollCount.toLocaleString()} poll{pollCount === 1 ? "" : "s"}
                              </p>
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed border-primary/20 bg-background/60 p-3">
                        <p className="text-sm text-muted-foreground">You haven’t joined any discussions yet.</p>
                        <Button className="mt-3 w-full" size="sm" variant="outline" asChild>
                          <Link href="/discourse">Browse discourse</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            ) : issuesQuery.isLoading ? (
              <SidebarWidgetSkeleton />
            ) : (
              <Card className="glass-panel p-4">
                <h3 className="font-semibold">Trending Issues</h3>
                <div className="mt-3 space-y-3">
                  {issues.map((issue) => (
                    <Link
                      href={`/issues/${issue.id}`}
                      key={issue.id}
                      className="block rounded-xl border border-primary/10 bg-background/60 p-3 transition-colors hover:border-primary/25 hover:bg-accent/50"
                    >
                      <p className="text-sm font-medium">{issue.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{issue.location}</p>
                    </Link>
                  ))}
                  {!issues.length ? (
                    <p className="text-sm text-muted-foreground">No trending issues yet.</p>
                  ) : null}
                </div>
              </Card>
            )}
            {politiciansQuery.isLoading ? (
              <SidebarWidgetSkeleton />
            ) : (
              <Card className="glass-panel p-4">
                <h3 className="font-semibold">Top Scorecards</h3>
                <div className="mt-3 space-y-3">
                  {politicians.map((person) => (
                    <div key={person.id} className="flex items-center justify-between gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-primary/10 hover:bg-background/50">
                      <div>
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.position}</p>
                      </div>
                      <Badge variant="secondary">{person.performanceScore}%</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {pollsQuery.isLoading ? (
              <SidebarWidgetSkeleton />
            ) : (
              <Card className="glass-panel p-4">
                <h3 className="font-semibold">Active Poll</h3>
                <p className="mt-2 text-sm text-muted-foreground">{polls[0]?.question ?? "No active poll yet."}</p>
                <Button className="mt-4 w-full" variant="outline" disabled={!polls[0]} asChild={Boolean(polls[0])}>
                  {polls[0] ? <Link href={`/polls/${polls[0].id}`}>Vote now</Link> : <span>Vote now</span>}
                </Button>
              </Card>
            )}
          </div>
        </aside>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const showBadge = item.href === "/notifications" && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-1 py-3 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <AppIcon icon={item.icon} size={20} />
                  {showBadge ? <NotificationBadge count={unreadCount} className="absolute -right-3 -top-2 min-w-4 px-1" /> : null}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
