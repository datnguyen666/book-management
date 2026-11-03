import axios from "axios";

import { useAuthStore } from "@/store/auth.store";

export const NETWORK_ERROR_MESSAGE =
  "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng.";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_ORIGIN}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Xử lý mất kết nối mạng hoặc server không phản hồi theo spec
    if (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error"
    ) {
      error.message = NETWORK_ERROR_MESSAGE;

      if (!error.response) {
        error.response = {
          data: { message: NETWORK_ERROR_MESSAGE },
          status: 0,
          statusText: "Network Error",
          headers: {},
          config: error.config,
        };
      } else if (error.response.data && typeof error.response.data === "object") {
        error.response.data.message = NETWORK_ERROR_MESSAGE;
      }
    }

    return Promise.reject(error);
  },
);
