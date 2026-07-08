"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const adminRoles = ["ADMIN", "SUPER_ADMIN"] as const;

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = Boolean(user?.role && adminRoles.includes(user.role as "ADMIN" | "SUPER_ADMIN"));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, isAuthenticated, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-md border bg-card p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-lg font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the right part of TheChoice9ja.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
