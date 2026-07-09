"use client";

import { useQuery } from "@tanstack/react-query";
import { Notification03Icon } from "@/lib/icons";
import { AppIcon } from "@/components/ui/icon";
import { PageHeader } from "@/components/shared/page-header";
import { QueryListState } from "@/components/shared/query-states";
import { NotificationCardSkeleton } from "@/components/skeletons/card-skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { asArray, displayName, formatDate } from "@/lib/content-utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useLoginModalStore } from "@/stores/login-modal-store";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const { isAuthenticated } = useRequireAuth();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getData<unknown>(endpoints.notifications.byUser(user!.id)),
    enabled: Boolean(user?.id)
  });
  const notifications = asArray<ApiRecord>(query.data);

  return (
    <div>
      <PageHeader title="Notifications" description="Issue updates, poll reminders, replies, and community activity." />
      <div className="space-y-3">
        {!isAuthenticated ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">Sign in to see issue updates, poll reminders, and community activity.</p>
              <Button onClick={() => openLoginModal("Sign in to view your notifications.")}>Sign in</Button>
            </CardContent>
          </Card>
        ) : null}
        {user ? (
          <QueryListState
            isLoading={query.isLoading}
            isEmpty={notifications.length === 0}
            count={4}
            skeleton={<NotificationCardSkeleton />}
            emptyMessage="No notifications yet."
          >
            {notifications.map((item) => (
              <Card key={String(item.id)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <AppIcon icon={Notification03Icon} size={20} className="text-primary" />
                  <div>
                    <p>{String(item.message ?? displayName(item))}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </QueryListState>
        ) : null}
      </div>
    </div>
  );
}
