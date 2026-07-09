import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const reportsService = {
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.reports.create, payload)
};
