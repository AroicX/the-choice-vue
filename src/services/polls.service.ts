import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const pollsService = {
  list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.polls.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.polls.detail(id)),
  results: <T = unknown>(id: string) => apiClient.get<T>(endpoints.polls.results(id)),
  create: <T = unknown>(discussionId: string, payload: unknown) => apiClient.post<T>(endpoints.polls.create(discussionId), payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.polls.update(id), payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.polls.delete(id))
};
