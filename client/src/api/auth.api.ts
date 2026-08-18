import { api } from "@/api/axios";

import type { LoginRequest, LoginResponse, User } from "@/types/auth";

export interface SetPasswordRequest {
  token: string;
  password: string;
}

export async function setPassword(
  data: SetPasswordRequest,
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    "/auth/set-password",
    data,
  );

  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<User>("/auth/profile");

  return response.data;
}
