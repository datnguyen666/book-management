import { api } from "@/api/axios";

import type { LoginRequest, LoginResponse, User } from "@/types/auth";

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}

export async function getProfile() {
  const response = await api.get<User>("/auth/profile");

  return response.data;
}
