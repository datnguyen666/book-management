import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // Avatar
  const avatarText = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  // Role hiển thị
  const displayRole = user?.role === "ADMIN" ? "Administrator" : "Staff";

  // Format ngày + giờ
  const formattedDate = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDateTime = `${formattedDate} • ${formattedTime}`;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Page title + Date/Time */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>

        <p className="mt-0.5 text-xs" style={{ color: "#94a8c2" }}>
          {formattedDateTime}
        </p>
      </div>

      {/* User area */}
      <div className="flex items-center gap-4">
        {/* User information */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: "#111827",
              color: "#d4a853",
            }}
          >
            {avatarText}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: "#111827" }}>
              {user?.username ?? "Unknown User"}
            </p>

            <p className="text-xs" style={{ color: "#94a8c2" }}>
              {displayRole}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-md px-4 py-2 text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
            border: "1px solid #d4a853",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.04em",
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
