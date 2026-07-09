import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const analyticsService = {
  overview: <T = unknown>() => apiClient.get<T>(endpoints.analytics.overview),
  dashboard: <T = unknown>() => apiClient.get<T>(endpoints.analytics.dashboard)
};
