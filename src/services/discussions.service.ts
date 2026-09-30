import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const discussionsService = {
  list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.discussions.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.discussions.detail(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.discussions.create, payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.discussions.update(id), payload),
  /** Owner or admin only. null resets the room to its generated pattern. */
  setCover: <T = unknown>(id: string, coverImage: string | null) =>
    apiClient.patch<T>(endpoints.discussions.cover(id), { coverImage }),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.discussions.delete(id))
};
