export type Role = "ADMIN" | "STAFF" | "MEMBER";

export type LoginPortal = "MEMBER" | "MANAGEMENT";

export interface LoginRequest {
  username: string;
  password: string;
  portal?: LoginPortal;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  memberCode?: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
