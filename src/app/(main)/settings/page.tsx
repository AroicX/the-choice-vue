"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <div>
      <PageHeader title="Settings" description="Account, privacy, notifications, and display preferences." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold">Account</h2>
            {user ? (
              <>
                <p className="text-sm text-muted-foreground">{user.email ?? user.username}</p>
                <Button variant="outline" asChild><Link href="/profile">View profile</Link></Button>
                <Button variant="destructive" onClick={clearSession}>Log out</Button>
              </>
            ) : (
              <Button asChild><Link href="/login">Log in</Link></Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold">Display</h2>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
