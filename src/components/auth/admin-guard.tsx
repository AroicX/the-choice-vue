"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecurityCheckIcon } from "@/lib/icons";
import { AppIcon } from "@/components/ui/icon";
import { useAuthStore } from "@/stores/auth-store";

const controlRoles = ["ADMIN", "SUPER_ADMIN", "MODERATOR"] as const;

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const canAccessControl = Boolean(user?.role && controlRoles.includes(user.role as "ADMIN" | "SUPER_ADMIN" | "MODERATOR"));

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!canAccessControl) {
      router.replace("/");
    }
  }, [canAccessControl, hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-md border bg-card p-6 text-center shadow-sm">
          <AppIcon icon={SecurityCheckIcon} size={32} className="mx-auto text-primary" />
          <h1 className="mt-4 text-lg font-semibold">Loading control session</h1>
          <p className="mt-2 text-sm text-muted-foreground">Checking your saved session.</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !canAccessControl) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-md border bg-card p-6 text-center shadow-sm">
          <AppIcon icon={SecurityCheckIcon} size={32} className="mx-auto text-primary" />
          <h1 className="mt-4 text-lg font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the right part of TheChoice9ja.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
