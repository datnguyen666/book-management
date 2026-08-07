import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function DashboardPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>

      <p className="mb-6">
        Welcome, <strong>{user?.username}</strong> ({user?.role})
      </p>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
