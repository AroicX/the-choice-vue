import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth-store";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api",
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
  (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().clearSession();
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.errors?.join(", ") ??
      error.message ??
      "Request failed";

    return Promise.reject(new Error(message));
  }
);

export async function getData<T>(url: string, params?: Record<string, unknown>) {
  const response = await api.get<ApiEnvelope<T> | T>(url, { params });
  const payload = response.data;
  return typeof payload === "object" && payload !== null && "data" in payload
    ? (payload as ApiEnvelope<T>).data as T
    : (payload as T);
}
