import { api } from "@/api/axios";

import type { LoginRequest, LoginResponse, User } from "@/types/auth";

export interface SetPasswordRequest {
  token: string;
  currentPassword: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
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

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    "/auth/forgot-password",
    data,
  );

  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    "/auth/reset-password",
    data,
  );

  return response.data;
}
