import { api, type ApiEnvelope } from "@/services/client/api";
import { useAuthStore } from "@/stores/auth-store";

export type ApiClientParams = Record<string, string | number | boolean | undefined | null>;

export class ApiClientError extends Error {
  status?: number;
  errors?: string[];

  constructor(message: string, status?: number, errors?: string[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

async function request<T>(method: "get" | "post" | "patch" | "delete", url: string, data?: unknown, params?: ApiClientParams) {
  try {
    const response = await api.request<ApiEnvelope<T> | T>({ method, url, data, params });
    return unwrap<T>(response.data);
  } catch (error) {
    if (typeof window !== "undefined" && error instanceof Error && /401|unauthorized/i.test(error.message)) {
      useAuthStore.getState().clearSession();
      window.location.assign("/login");
    }
    throw error instanceof ApiClientError ? error : new ApiClientError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
  }
}

export const apiClient = {
  get: <T>(url: string, params?: ApiClientParams) => request<T>("get", url, undefined, params),
  post: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("post", url, data, params),
  patch: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("patch", url, data, params),
  delete: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("delete", url, data, params)
};
