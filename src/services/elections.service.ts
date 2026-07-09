import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const electionsService = {
  list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.elections.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.elections.detail(id)),
  results: <T = unknown>(id: string) => apiClient.get<T>(endpoints.elections.results(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.elections.create, payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.elections.update(id), payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.elections.delete(id))
};
