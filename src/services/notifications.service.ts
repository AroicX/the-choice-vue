import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const notificationsService = {
  byUser: <T = unknown>(userId: string) => apiClient.get<T[]>(endpoints.notifications.byUser(userId)),
  count: <T = unknown>(userId: string) => apiClient.get<T>(endpoints.notifications.count(userId)),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.notifications.detail(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.notifications.create, payload),
  markRead: <T = unknown>(id: string) => apiClient.patch<T>(endpoints.notifications.markRead(id)),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.notifications.delete(id))
};
