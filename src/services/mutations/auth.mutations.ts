import { api, type ApiEnvelope } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import type { User } from "@/types";

export type LoginInput = {
  email?: string;
  phoneNo?: string;
  password: string;
};

export type AuthSessionPayload = {
  user: User;
  token: string;
};

function unwrapAuthSession(payload: ApiEnvelope<AuthSessionPayload> | AuthSessionPayload): AuthSessionPayload {
  if (payload && typeof payload === "object" && "data" in payload && payload.data) {
    return payload.data;
  }
  return payload as AuthSessionPayload;
}

export async function loginMutation(input: LoginInput) {
  const response = await api.post<ApiEnvelope<AuthSessionPayload> | AuthSessionPayload>(
    endpoints.auth.login,
    input
  );
  return unwrapAuthSession(response.data);
}

export type SignupInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNo: string;
  password: string;
};

export async function signupMutation(input: SignupInput) {
  const response = await api.post<ApiEnvelope<AuthSessionPayload> | AuthSessionPayload>(
    endpoints.auth.signup,
    input
  );
  return unwrapAuthSession(response.data);
}
