import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getAppBranding, getRouteTitle } from "@/utils/branding";
import { getMediaUrl } from "@/lib/media";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có đang ở trang Dashboard hay không
  const isDashboard = location.pathname === "/dashboard";

  // State đồng hồ thời gian thực (cập nhật mỗi giây như cũ)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Search state & input ref
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);

  // Image error fallback
  const [prevAvatar, setPrevAvatar] = useState(user?.avatar);
  const [headerImgError, setHeaderImgError] = useState(false);

  // Refs for click outside
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  if (user?.avatar !== prevAvatar) {
    setPrevAvatar(user?.avatar);
    setHeaderImgError(false);
  }

  // Phím tắt Ctrl+K hoặc Cmd+K để focus tìm kiếm (chỉ khi ở Dashboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDashboard && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDashboard]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/books?search=${encodeURIComponent(query)}`);
      searchInputRef.current?.blur();
    }
  };

  // Avatar text initials
  const avatarText = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(-2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.username
      ? user.username.slice(0, 2).toUpperCase()
      : "??";

  // Role hiển thị và cấu hình style badge
  const roleConfig = (() => {
    switch (user?.role) {
      case "ADMIN":
        return {
          label: "Quản trị viên",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-300/80",
        };
      case "STAFF":
        return {
          label: "Thủ thư",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "MEMBER":
      default:
        return {
          label: "Bạn đọc",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
    }
  })();

  // Format ngày + giờ (Thứ, Ngày/Tháng/Năm • Giờ:Phút:Giây)
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

  // Mock thông báo theo vai trò người dùng
  const mockNotifications =
    user?.role === "MEMBER"
      ? [
          {
            id: 1,
            title: "Khám phá sách mới",
            content: "Nhiều tựa sách phong phú vừa được cập nhật vào kho thư viện.",
            time: "Hôm nay",
            unread: true,
            link: "/books",
          },
          {
            id: 2,
            title: "Tủ sách cá nhân",
            content: "Kiểm tra hạn trả sách để tránh phát sinh tình trạng quá hạn.",
            time: "Hôm qua",
            unread: false,
            link: "/my-borrows",
          },
        ]
      : [
          {
            id: 1,
            title: "Yêu cầu mượn sách",
            content: "Có yêu cầu mượn sách mới đang chờ nhân viên phê duyệt.",
            time: "10 phút trước",
            unread: true,
            link: "/borrows",
          },
          {
            id: 2,
            title: "Báo cáo tài sản",
            content: "Số liệu tổng giá trị sách và tồn kho đã được đồng bộ mới.",
            time: "2 giờ trước",
            unread: false,
            link: "/assets",
          },
        ];

  return (
    <header className="relative z-30 flex h-[70px] w-full items-center justify-between gap-3 sm:gap-4 border-b border-[#E6DFCE] bg-white/95 px-3.5 sm:px-6 backdrop-blur-md transition-all">
      {/* ---------------- TRÁI: Hamburger + Tiêu đề + Thời gian ---------------- */}
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3 flex-1 sm:flex-initial">
        {/* Nút Hamburger cho Mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Mở menu điều hướng"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50 lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Tiêu đề trang + Thời gian ở dưới */}
        <div className="min-w-0">
          <h2
            className="truncate text-base sm:text-lg lg:text-xl font-bold tracking-tight text-stone-900 font-heading leading-tight"
            style={{ fontFamily: "var(--heading)" }}
          >
            {pageTitle}
          </h2>
          <p
            className="mt-0.5 hidden truncate text-xs text-stone-500 font-mono sm:block"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {formattedDateTime}
          </p>
        </div>
      </div>

      {/* ---------------- GIỮA: Thanh Tìm Kiếm Nhanh (CHỈ HIỆN Ở DASHBOARD) ---------------- */}
      {isDashboard && (
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full group flex items-center"
          >
            <div className="pointer-events-none absolute left-3.5 flex items-center text-stone-400 group-focus-within:text-[#B8863B] transition-colors">
              <Search size={16} />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sách, tác giả, thể loại..."
              className="w-full rounded-xl border border-stone-200/90 bg-stone-50/80 py-2 pl-9 pr-20 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 transition-all duration-200 hover:border-amber-400/60 focus:bg-white focus:border-[#C89B3C] focus:outline-none focus:ring-3 focus:ring-[#C89B3C]/15"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-400 shadow-2xs">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- PHẢI: Thông báo + User Profile ---------------- */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Nút Chuông Thông Báo */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsProfileOpen(false);
              setHasUnreadNotice(false);
            }}
            aria-expanded={isNotificationsOpen}
            aria-label="Thông báo hệ thống"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50/60 text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50 cursor-pointer"
          >
            <Bell size={18} />
            {hasUnreadNotice && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#C89B3C] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Popover Thông Báo (Responsive max-w để tránh tràn màn hình mobile) */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-76 sm:w-88 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 z-50">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#C89B3C]" />
                  <span className="text-sm font-semibold text-stone-900">Thông báo</span>
                </div>
                <span className="text-[11px] font-medium text-stone-500">
                  {mockNotifications.length} tin mới
                </span>
              </div>

              <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
                {mockNotifications.map((notice) => (
                  <Link
                    key={notice.id}
                    to={notice.link}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block rounded-xl p-2.5 text-left transition-colors hover:bg-stone-50 border border-transparent hover:border-stone-200/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                        {notice.unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C89B3C]" />
                        )}
                        {notice.title}
                      </p>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {notice.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                      {notice.content}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-2.5 border-t border-stone-100 pt-2 text-center">
                <Link
                  to={user?.role === "MEMBER" ? "/my-borrows" : "/borrows"}
                  onClick={() => setIsNotificationsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#8A5A1E] hover:text-[#C89B3C] transition-colors"
                >
                  <span>Xem chi tiết lưu thông</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Thanh ngăn cách */}
        <div className="hidden sm:block h-6 w-px bg-stone-200" />

        {/* ---------------- USER PROFILE BUTTON & DROPDOWN ---------------- */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotificationsOpen(false);
            }}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-stone-200/80 bg-white p-1 sm:px-3 sm:py-1.5 transition-all hover:bg-stone-50 hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50 cursor-pointer"
          >
            {/* Avatar kèm status badge */}
            <div className="relative">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold overflow-hidden shadow-2xs ring-2 ring-[#C89B3C]/30"
                style={{
                  backgroundColor: "#12192B",
                  color: "#C89B3C",
                }}
              >
                {user?.avatar && !headerImgError ? (
                  <img
                    src={getMediaUrl(user.avatar)}
                    alt={user.fullName || user.username}
                    onError={() => setHeaderImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Thông tin Text (Chỉ hiện từ màn hình sm trở lên) */}
            <div className="hidden text-left sm:block">
              <p className="max-w-[120px] lg:max-w-[140px] truncate text-xs font-semibold text-stone-900 leading-tight">
                {user?.fullName || user?.username}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold border ${roleConfig.badgeClass}`}
                >
                  {roleConfig.label}
                </span>
              </div>
            </div>

            <ChevronDown
              size={15}
              className={`text-stone-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180 text-stone-700" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 z-50"
            >
              {/* Header của Popover */}
              <div className="rounded-xl bg-stone-50/80 p-3 border border-stone-100">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-[#C89B3C]/40"
                    style={{
                      backgroundColor: "#12192B",
                      color: "#C89B3C",
                    }}
                  >
                    {user?.avatar && !headerImgError ? (
                      <img
                        src={getMediaUrl(user.avatar)}
                        alt={user.fullName || user.username}
                        onError={() => setHeaderImgError(true)}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      avatarText
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-stone-900">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="truncate text-[11px] text-stone-500">
                      {user?.email || `@${user?.username}`}
                    </p>
                    {user?.memberCode && (
                      <p className="mt-0.5 font-mono text-[10px] text-[#8A5A1E]">
                        Mã thẻ: {user.memberCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-stone-200/60 pt-2 text-[11px]">
                  <span className="text-stone-500">Vai trò</span>
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-semibold text-[10px] border ${roleConfig.badgeClass}`}
                  >
                    {roleConfig.label}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="mt-2 space-y-0.5">
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <UserIcon size={15} className="text-stone-400" />
                  <span>Hồ sơ cá nhân</span>
                </Link>

                <Link
                  to="/profile/edit"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Settings size={15} className="text-stone-400" />
                  <span>Cập nhật tài khoản</span>
                </Link>

                {user?.role === "MEMBER" ? (
                  <Link
                    to="/my-borrows"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                  >
                    <BookOpen size={15} className="text-stone-400" />
                    <span>Tủ sách của tôi</span>
                  </Link>
                ) : (
                  <Link
                    to="/borrows"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                  >
                    <BookOpen size={15} className="text-stone-400" />
                    <span>Quản lý mượn trả</span>
                  </Link>
                )}
              </div>

              {/* Đường phân cách */}
              <div className="my-1.5 border-t border-stone-100" />

              {/* Nút Đăng xuất */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
