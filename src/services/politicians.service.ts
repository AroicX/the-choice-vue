import { crudService } from "@/services/admin-service-utils";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const politiciansService = {
  ...crudService("/politicians"),
  scorecard: <T = unknown>(id: string) => apiClient.get<T>(endpoints.politicians.scorecard(id)),
  promises: <T = unknown>(id: string) => apiClient.get<T[]>(endpoints.politicians.promises(id)),
  ratings: <T = unknown>(id: string) => apiClient.get<T[]>(endpoints.politicians.ratings(id))
};
