import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const postsService = {
  list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.posts.list, params),
  search: <T = unknown>(keyword: string) => apiClient.get<T[]>(endpoints.posts.search, { keyword }),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.posts.detail(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.posts.create, payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.posts.delete(id))
};
