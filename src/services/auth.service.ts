import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/services/client/endpoints";
import type { User } from "@/types";

export const authService = {
  login: (payload: { email?: string; phoneNo?: string; password: string }) => apiClient.post<{ user: User; token: string }>(endpoints.auth.login, payload),
  signup: (payload: Record<string, unknown>) => apiClient.post<{ user: User; token: string }>(endpoints.auth.signup, payload),
  listUsers: () => apiClient.get<User[]>(endpoints.admin.users),
  getUser: (id: string) => apiClient.get<User>(endpoints.admin.user(id)),
  updateUser: (id: string, payload: Record<string, unknown>) => apiClient.patch<User>(endpoints.admin.updateUser(id), payload),
  suspendUser: (id: string) => apiClient.patch<User>(endpoints.admin.suspendUser(id))
};
