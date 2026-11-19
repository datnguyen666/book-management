import { api } from "@/api/axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types/auth";

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

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", data);

  return response.data;
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

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch<User>("/auth/profile", data);

  return response.data;
}

export async function uploadAvatar(
  file: File,
): Promise<{ avatarUrl: string; avatar: string; user?: User }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{
    avatarUrl: string;
    avatar: string;
    user?: User;
  }>("/auth/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
