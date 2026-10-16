import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/auth";

interface RoleRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/books" replace />;
  }

  return <>{children}</>;
}
