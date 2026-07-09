import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const ratingsService = {
  list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.ratings.list, params),
  categories: <T = unknown>() => apiClient.get<T[]>(endpoints.ratings.categories),
  sdgCriteria: <T = unknown>() => apiClient.get<T[]>(endpoints.ratings.sdgCriteria),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.ratings.create, payload),
  update: <T = unknown>(payload: unknown) => apiClient.patch<T>("/ratings/update", payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.ratings.delete(id))
};
