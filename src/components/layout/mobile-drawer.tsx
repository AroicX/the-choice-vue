"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { mainNav, mobileNav } from "@/lib/constants";
import { userDisplayName, userInitials } from "@/lib/content-utils";
import { Cancel01Icon, Logout01Icon, Moon02Icon, Sun03Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const BOTTOM_TABS = new Set(mobileNav.map((item) => item.href));
// Everything the bottom tab bar can't hold.
const DRAWER_NAV = mainNav.filter((item) => !BOTTOM_TABS.has(item.href));

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  user: User | null;
  onSignIn: () => void;
  onLogout: () => void;
};

/**
 * X-style side drawer for small screens: who you are, then the sections the
 * bottom tab bar doesn't fit, then theme and log out. Slides in from the
 * left; Escape, the scrim or any link closes it.
 */
export function MobileDrawer({ open, onClose, pathname, user, onSignIn, onLogout }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      // Keep Tab inside the drawer while it's open.
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(300px,82vw)] flex-col bg-background pt-[env(safe-area-inset-top)] focus:outline-none"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) onClose();
            }}
          >
            <div className="flex items-start justify-between px-4 pt-3">
              {user ? (
                <Link href="/profile" onClick={onClose} className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {user.profilePic ? (
                    <Image src={user.profilePic} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
                      {userInitials(user)}
                    </span>
                  )}
                  <span className="mt-2 block truncate text-[16px] font-bold leading-5">{userDisplayName(user)}</span>
                  <span className="block truncate text-[14px] text-muted-foreground">@{user.username}</span>
                </Link>
              ) : (
                <div className="min-w-0 pr-2">
                  <p className="text-[17px] font-bold leading-6">New to Choice9ja?</p>
                  <p className="mt-0.5 text-[14px] leading-5 text-muted-foreground">Rate leaders, report issues and join the conversation.</p>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {!user ? (
              <div className="flex gap-2 px-4 pt-4">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/register" onClick={onClose}>
                    Create account
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                >
                  Sign in
                </Button>
              </div>
            ) : null}

            <nav aria-label="More" className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain border-t py-1">
              <ul>
                {DRAWER_NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-12 items-center gap-4 px-4 text-[17px] transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none",
                          active ? "font-bold" : "font-medium"
                        )}
                      >
                        <AppIcon icon={item.icon} size={22} strokeWidth={active ? 2.25 : 1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t py-1 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex h-12 w-full items-center gap-4 px-4 text-[15px] font-medium transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
              >
                <AppIcon icon={isDark ? Sun03Icon : Moon02Icon} size={20} />
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex h-12 w-full items-center gap-4 px-4 text-[15px] font-medium text-destructive transition-colors hover:bg-destructive/[0.06] focus-visible:bg-destructive/[0.06] focus-visible:outline-none"
                >
                  <AppIcon icon={Logout01Icon} size={20} />
                  Log out
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
