import { api, type ApiEnvelope } from "@/services/client/api";
import { ApiClientError, parseValidationPayload, type FieldErrors } from "@/lib/api-validation";
import { useAuthStore } from "@/stores/auth-store";

export type ApiClientParams = Record<string, string | number | boolean | undefined | null>;
export { ApiClientError, type FieldErrors };

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
    if (error instanceof ApiClientError) throw error;

    const parsed = parseValidationPayload(error);
    throw new ApiClientError(
      error instanceof Error ? error.message : parsed.message || "Something went wrong. Please try again.",
      undefined,
      undefined,
      parsed.fieldErrors,
      error
    );
  }
}

export const apiClient = {
  get: <T>(url: string, params?: ApiClientParams) => request<T>("get", url, undefined, params),
  post: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("post", url, data, params),
  patch: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("patch", url, data, params),
  delete: <T>(url: string, data?: unknown, params?: ApiClientParams) => request<T>("delete", url, data, params)
};
