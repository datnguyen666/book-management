import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function GuestRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
