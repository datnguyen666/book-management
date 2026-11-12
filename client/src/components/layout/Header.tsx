import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLocation, useNavigate } from "react-router-dom";
import { getAppBranding, getRouteTitle } from "@/utils/branding";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

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
  const displayRole =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "STAFF"
        ? "Staff"
        : "Member";

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
  const routeTitle = getRouteTitle(location.pathname, user?.role);
  const pageTitle = routeTitle || getAppBranding(user?.role).title;

  return (
    <header
      className="flex h-16 items-center justify-between gap-3 bg-white px-4 sm:px-6"
      style={{ borderBottom: "1px solid #E6DFCE" }}
    >
      {/* Hamburger - mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        className="shrink-0 text-gray-600 hover:text-gray-900 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Page title + Date/Time */}
      <div className="min-w-0 flex-1">
        <h2
          className="truncate text-lg font-semibold sm:text-xl font-heading"
          style={{ fontFamily: "var(--heading)", color: "#12192B" }}
        >
          {pageTitle}
        </h2>
        <p
          className="mt-0.5 hidden truncate text-xs sm:block"
          style={{
            color: "#8A93A6",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
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
              backgroundColor: "#12192B",
              color: "#C89B3C",
            }}
          >
            {avatarText}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: "#12192B" }}>
              {user?.fullName || user?.username}
            </p>

            <p className="text-xs" style={{ color: "#8A93A6" }}>
              {displayRole}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-md px-4 py-2 text-xs font-semibold transition-all duration-150 hover:opacity-85 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: "#12192B",
            color: "#C89B3C",
            border: "1px solid #B8863B",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
