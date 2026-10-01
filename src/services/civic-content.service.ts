import { crudService, listAllPages } from "@/services/admin-service-utils";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const factChecksService = {
  ...crudService("/fact-checks"),
  list: <T = unknown>(params?: Record<string, string | number | boolean | undefined | null>) =>
    apiClient.get<T[]>(endpoints.factChecks.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.factChecks.detail(id)),
  /** Every fact check, fetched page by page, for the admin screen. */
  listAll: <T = unknown>() => listAllPages<T>((params) => apiClient.get<T[]>(endpoints.factChecks.list, params))
};

const promises = crudService("/promises");

export const promisesService = {
  ...promises,
  /** Every campaign promise, fetched page by page, for the admin screen. */
  listAll: <T = unknown>() => listAllPages<T>((params) => promises.list(params))
};

const news = crudService("/news");

export const newsService = {
  ...news,
  /** Every article, fetched page by page, for the admin screen. */
  listAll: <T = unknown>() => listAllPages<T>((params) => news.list(params))
};

export const communitiesService = {
  list: <T = unknown>(params?: Record<string, string | number | boolean | undefined | null>) =>
    apiClient.get<T[]>(endpoints.communities.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.communities.detail(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.communities.create, payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.communities.update(id), payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.communities.delete(id)),
  join: <T = unknown>(id: string) => apiClient.post<T>(endpoints.communities.join(id)),
  leave: <T = unknown>(id: string) => apiClient.post<T>(endpoints.communities.leave(id))
};

export const issuesService = {
  list: <T = unknown>(params?: Record<string, string | number | boolean | undefined | null>) =>
    apiClient.get<T[]>(endpoints.issues.list, params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.issues.detail(id)),
  create: <T = unknown>(payload: unknown) => apiClient.post<T>(endpoints.issues.create, payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.issues.update(id), payload),
  remove: <T = unknown>(id: string) => apiClient.delete<T>(endpoints.issues.delete(id)),
  upvote: <T = unknown>(id: string) => apiClient.post<T>(endpoints.issues.upvote(id)),
  assignPolitician: <T = unknown>(id: string, politicianId: string) =>
    apiClient.post<T>(endpoints.issues.assignPolitician(id), { politicianId }),
  resolve: <T = unknown>(id: string) => apiClient.post<T>(endpoints.issues.resolve(id))
};
