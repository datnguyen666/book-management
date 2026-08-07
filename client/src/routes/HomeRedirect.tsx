import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function HomeRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return <Navigate to={accessToken ? "/dashboard" : "/login"} replace />;
}
