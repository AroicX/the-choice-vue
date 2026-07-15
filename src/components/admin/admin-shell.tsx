"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { adminNav } from "@/lib/admin-control-data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Cancel01Icon, Logout01Icon, Notification03Icon, Search01Icon, Settings01Icon, UserCircleIcon } from "@/lib/icons";

function resolveSearchTarget(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;

  const exact = adminNav.find((item) => item.label.toLowerCase() === needle || item.href.replace("/control/", "") === needle);
  if (exact) return exact.href;

  const partial = adminNav.find((item) => item.label.toLowerCase().includes(needle) || item.href.includes(needle.replace(/\s+/g, "-")));
  if (partial) return `${partial.href}?q=${encodeURIComponent(query.trim())}`;

  return `/control/posts?q=${encodeURIComponent(query.trim())}`;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => ({
      label: index === 0 ? "Control" : part.replaceAll("-", " "),
      href: `/${parts.slice(0, index + 1).join("/")}`
    }));
  }, [pathname]);

  const title =
    pathname === "/control"
      ? "Dashboard"
      : (adminNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Control");

  function handleLogout() {
    clearSession();
    document.cookie = "choice9ja-role=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const target = resolveSearchTarget(search);
    if (!target) return;
    router.push(target);
    setMobileNavOpen(false);
  }

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {adminNav.map((item) => {
        const active = pathname === item.href || (item.href !== "/control" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNavOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <span>{item.label}</span>
            {active ? <span className="h-2 w-2 rounded-full bg-primary-foreground" /> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img src="/legacy/logo.png" alt="Choice9ja" className="h-10 w-10 rounded-xl bg-card object-contain" />
          <div>
            <p className="text-sm font-semibold">TheChoice9ja</p>
            <p className="text-xs text-muted-foreground">Control panel</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-medium">
            {user?.firstName ?? "Admin"} {user?.lastName ?? ""}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.role ?? "ADMIN"}</p>
        </div>
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-background/60 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <div className="flex items-center gap-3">
                <img src="/legacy/logo.png" alt="Choice9ja" className="h-9 w-9 rounded-xl bg-card object-contain" />
                <span className="text-sm font-semibold">Control</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                <AppIcon icon={Cancel01Icon} size={18} />
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex h-screen flex-col lg:pl-72">
        <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-4 shadow-sm backdrop-blur-xl lg:gap-4 lg:px-6">
          <Button variant="outline" size="sm" className="rounded-lg lg:hidden" onClick={() => setMobileNavOpen(true)}>
            Menu
          </Button>
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-2 text-xs capitalize text-muted-foreground sm:flex">
              {crumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  <Link href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </Link>
                  {index < crumbs.length - 1 ? <span>/</span> : null}
                </span>
              ))}
            </div>
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
          </div>
          <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm md:block">
            <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-xl border-border bg-background pl-10"
              placeholder="Search modules or posts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" title="Notifications" asChild>
            <Link href="/control/notifications">
              <AppIcon icon={Notification03Icon} size={20} />
            </Link>
          </Button>
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-left text-sm shadow-sm"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <AppIcon icon={UserCircleIcon} size={18} />
              </span>
              <span className="hidden sm:block">
                <span className="block font-semibold text-foreground">{user?.firstName ?? "Admin"}</span>
                <span className="block text-xs text-muted-foreground">{user?.role ?? "ADMIN"}</span>
              </span>
            </button>
            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-panel">
                <Link href="/control/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent" onClick={() => setProfileOpen(false)}>
                  <AppIcon icon={Settings01Icon} size={16} />
                  Settings
                </Link>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <AppIcon icon={Logout01Icon} size={16} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
