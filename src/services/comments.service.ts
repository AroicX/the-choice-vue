import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";

export const commentsService = {
  list: <T = unknown>() => apiClient.get<T[]>(endpoints.comments.list),
  byPost: <T = unknown>(postId: string, params?: { skip?: number; take?: number }) => apiClient.get<T[]>(endpoints.comments.byPost(postId), params),
  detail: <T = unknown>(id: string) => apiClient.get<T>(endpoints.comments.detail(id)),
  create: <T = unknown>(postId: string, payload: unknown) => apiClient.post<T>(endpoints.comments.create(postId), payload),
  update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(endpoints.comments.update(id), payload),
  remove: <T = unknown>(id: string, reason?: string) => apiClient.delete<T>(endpoints.comments.delete(id), reason ? { reason } : undefined)
};
