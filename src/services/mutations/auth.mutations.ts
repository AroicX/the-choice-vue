import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { User } from "@/types";

export type LoginInput = {
  email?: string;
  phoneNo?: string;
  password: string;
};

export type LoginResponse = {
  status?: number;
  user: User;
  token: string;
};

export async function loginMutation(input: LoginInput) {
  const response = await api.post<LoginResponse>(endpoints.auth.login, input);
  return response.data;
}

export async function signupMutation(input: Record<string, string>) {
  const response = await api.post<LoginResponse>(endpoints.auth.signup, input);
  return response.data;
}
