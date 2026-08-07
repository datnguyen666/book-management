import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

export function Header() {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div>
        {user?.username} ({user?.role})
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
