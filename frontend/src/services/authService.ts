import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { AuthResponse, UserSummary } from "../types/auth";

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
    email,
    password,
  });

  return data.data;
}

export async function me() {
  const { data } = await api.get<ApiResponse<UserSummary>>("/auth/me");
  return data.data;
}
