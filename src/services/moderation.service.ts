import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { AdminListParams } from "@/services/admin-service-utils";

export const moderationService = {
  reports: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(endpoints.moderation.reports, params),
  createAction: <T = unknown>(payload: unknown) => apiClient.post<T>("/moderation/actions", payload)
};
