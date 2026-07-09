import { apiClient, type ApiClientParams } from "@/lib/api-client";

export type AdminListParams = ApiClientParams & {
  skip?: number;
  take?: number;
  keyword?: string;
};

export function crudService(basePath: string) {
  return {
    list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(basePath, params),
    detail: <T = unknown>(id: string) => apiClient.get<T>(`${basePath}/${id}`),
    create: <T = unknown>(payload: unknown) => apiClient.post<T>(basePath, payload),
    update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(`${basePath}/${id}`, payload),
    remove: <T = unknown>(id: string) => apiClient.delete<T>(`${basePath}/${id}`)
  };
}
