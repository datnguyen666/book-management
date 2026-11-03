import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/set-password" replace />;
  }

  return <Outlet />;
}
