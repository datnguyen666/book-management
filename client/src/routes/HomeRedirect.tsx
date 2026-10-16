import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function HomeRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "MEMBER") {
    return <Navigate to="/books" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
