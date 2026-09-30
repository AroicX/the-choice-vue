import { crudService, listAllPages } from "@/services/admin-service-utils";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

const politicians = crudService("/politicians");

export const politiciansService = {
  ...politicians,
  /** Every politician, fetched page by page. Use for pickers, not public lists. */
  listAll: <T = unknown>() => listAllPages<T>((params) => politicians.list(params)),
  scorecard: <T = unknown>(id: string) => apiClient.get<T>(endpoints.politicians.scorecard(id)),
  promises: <T = unknown>(id: string) => apiClient.get<T[]>(endpoints.politicians.promises(id)),
  issues: <T = unknown>(id: string) => apiClient.get<T[]>(endpoints.politicians.issues(id)),
  ratings: <T = unknown>(id: string) => apiClient.get<T[]>(endpoints.politicians.ratings(id)),
  compare: <T = unknown>(politicianA: string, politicianB: string) =>
    apiClient.get<T>(endpoints.scorecards.compare, { politicianA, politicianB }),
  scorecardBundle: <T = unknown>(id: string) => apiClient.get<T>(endpoints.scorecards.politician(id))
};
