"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { adminNav } from "@/lib/admin-control-data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logout01Icon, Notification03Icon, Search01Icon, Settings01Icon, UserCircleIcon } from "@/lib/icons";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [profileOpen, setProfileOpen] = useState(false);
  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => ({
      label: index === 0 ? "Control" : part.replaceAll("-", " "),
      href: `/${parts.slice(0, index + 1).join("/")}`
    }));
  }, [pathname]);
  const title = pathname === "/control"
    ? "Dashboard"
    : adminNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Control";

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <img src="/legacy/logo.png" alt="Choice9ja" className="h-10 w-10 rounded-lg bg-white object-contain" />
          <div>
            <p className="text-sm font-semibold text-white">TheChoice9ja</p>
            <p className="text-xs text-slate-400">Control panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/control" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
                  active && "bg-primary text-white shadow-sm hover:bg-primary"
                )}
              >
                <span>{item.label}</span>
                {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex h-screen flex-col lg:pl-72">
        <header className="z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-2 text-xs capitalize text-slate-500 sm:flex">
              {crumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  <Link href={crumb.href} className="hover:text-primary">{crumb.label}</Link>
                  {index < crumbs.length - 1 ? <span>/</span> : null}
                </span>
              ))}
            </div>
            <h1 className="truncate text-lg font-semibold text-slate-950">{title}</h1>
          </div>
          <div className="relative hidden w-full max-w-md md:block">
            <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <Input className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-10" placeholder="Search users, reports, posts..." />
          </div>
          <Button variant="ghost" size="icon" className="rounded-lg text-slate-600" title="Notifications">
            <AppIcon icon={Notification03Icon} size={20} />
          </Button>
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-sm shadow-sm"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <AppIcon icon={UserCircleIcon} size={18} />
              </span>
              <span className="hidden sm:block">
                <span className="block font-semibold text-slate-900">{user?.firstName ?? "Admin"}</span>
                <span className="block text-xs text-slate-500">{user?.role ?? "ADMIN"}</span>
              </span>
            </button>
            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white p-2 shadow-panel">
                <Link href="/control/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100">
                  <AppIcon icon={Settings01Icon} size={16} />
                  Settings
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    clearSession();
                    document.cookie = "choice9ja-role=; path=/; max-age=0; SameSite=Lax";
                    router.push("/login");
                  }}
                >
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
