export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF";
}
