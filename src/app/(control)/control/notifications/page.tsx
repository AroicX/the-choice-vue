"use client";

import { useAuthStore } from "@/stores/auth-store";
import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapNotification, notificationPayload, notificationsMeta } from "@/components/admin/admin-record-mappers";
import { notificationsService } from "@/services/notifications.service";

export default function ControlNotificationsPage() {
  return (
    <AdminApiResourcePage
      meta={notificationsMeta}
      queryKey={["control", "notifications"]}
      queryFn={() => {
        const userId = useAuthStore.getState().user?.id;
        return userId ? notificationsService.byUser(userId) : Promise.resolve([]);
      }}
      mapRecord={mapNotification}
      createFn={(payload) => notificationsService.create(payload)}
      deleteFn={(id) => notificationsService.remove(id)}
      createPayload={notificationPayload}
    />
  );
}
