import axios, { AxiosError } from "axios";
import { ApiClientError, parseValidationPayload } from "@/lib/api-validation";
import { useAuthStore } from "@/stores/auth-store";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://thechoice9ja-api-production.up.railway.app/api",
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().clearSession();
    }

    const payload = error.response?.data;
    const parsed = parseValidationPayload(payload);
    const message =
      parsed.message ||
      (payload && typeof payload === "object" && "message" in payload && typeof (payload as { message?: unknown }).message === "string"
        ? String((payload as { message: string }).message)
        : null) ||
      error.message ||
      "Request failed";

    const listErrors =
      payload && typeof payload === "object" && Array.isArray((payload as { errors?: unknown }).errors)
        ? ((payload as { errors: unknown[] }).errors).map(String)
        : Array.isArray((payload as { message?: unknown } | undefined)?.message)
          ? ((payload as { message: unknown[] }).message).map(String)
          : undefined;

    return Promise.reject(
      new ApiClientError(message, error.response?.status, listErrors, parsed.fieldErrors, payload)
    );
  }
);

const SINGULAR_RESOURCE_KEYS = ["poll", "election", "post", "comment", "discussion", "user"] as const;

export async function getData<T>(url: string, params?: Record<string, unknown>) {
  const response = await api.get<ApiEnvelope<T> | T>(url, { params });
  const payload = response.data;
  if (!payload || typeof payload !== "object") return payload as T;

  if ("data" in payload && (payload as ApiEnvelope<T>).data !== undefined) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  // Backend often returns `{ poll: ... }` / `{ election: ... }` instead of `{ data: ... }`.
  for (const key of SINGULAR_RESOURCE_KEYS) {
    if (key in payload && (payload as Record<string, unknown>)[key] != null) {
      return (payload as Record<string, unknown>)[key] as T;
    }
  }

  return payload as T;
}
