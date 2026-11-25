import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { getAppBranding, getRouteTitle } from "@/utils/branding";
import { getMediaUrl } from "@/lib/media";
import { useBooks } from "@/hooks/use-books";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import type { Notification, NotificationType } from "@/api/notification.api";

interface HeaderProps {
  onMenuClick: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "BORROW_APPROVED":
      return {
        icon: <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />,
        badgeBg: "bg-emerald-50",
      };
    case "BORROW_REJECTED":
      return {
        icon: <XCircle size={15} className="text-rose-600 shrink-0" />,
        badgeBg: "bg-rose-50",
      };
    case "DUE_SOON":
      return {
        icon: <Clock size={15} className="text-amber-600 shrink-0" />,
        badgeBg: "bg-amber-50",
      };
    case "OVERDUE":
      return {
        icon: <AlertTriangle size={15} className="text-red-600 shrink-0" />,
        badgeBg: "bg-red-50",
      };
    case "BORROW_REQUEST":
    default:
      return {
        icon: <BookOpen size={15} className="text-blue-600 shrink-0" />,
        badgeBg: "bg-blue-50",
      };
  }
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Kiểm tra trang /books và đồng bộ URL query
  const isBooksPage = location.pathname === "/books";
  const urlSearchParam = searchParams.get("search") || "";

  // State đồng hồ thời gian thực (cập nhật mỗi giây như cũ)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Search states & refs
  const [searchQuery, setSearchQuery] = useState(() => (isBooksPage ? urlSearchParam : ""));
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearchParam);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Real-time notifications hook
  const { data: notificationData, isLoading: isNotificationsLoading } =
    useNotifications({ limit: 15 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationData?.data ?? [];
  const unreadCount = notificationData?.unreadCount ?? 0;
  const hasUnreadNotice = unreadCount > 0;

  const handleNotificationClick = (notice: Notification) => {
    if (!notice.isRead) {
      markAsReadMutation.mutate(notice.id);
    }
    setIsNotificationsOpen(false);
    navigate(notice.link);
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

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

  // Đồng bộ từ khóa từ URL vào input khi đang ở trang /books theo khuyến nghị React (trong render)
  if (isBooksPage && prevUrlSearch !== urlSearchParam) {
    setPrevUrlSearch(urlSearchParam);
    setSearchQuery(urlSearchParam);
  } else if (!isBooksPage && prevUrlSearch !== "") {
    setPrevUrlSearch("");
  }

  // Debounce search query cho live search preview (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Live preview query
  const shouldFetchLiveSearch = debouncedQuery.length >= 1;
  const { data: searchResults, isLoading: isSearchLoading } = useBooks({
    search: shouldFetchLiveSearch ? debouncedQuery : undefined,
    limit: 5,
  });

  const previewBooks = searchResults?.data ?? [];
  const isDropdownOpen = isSearchFocused && debouncedQuery.length >= 1;

  // Phím tắt Ctrl+K hoặc Cmd+K để focus tìm kiếm toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement;
        const isEditing =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;

        if (!isEditing) {
          e.preventDefault();
          if (window.innerWidth < 768) {
            setIsMobileSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
          } else {
            searchInputRef.current?.focus();
            setIsSearchFocused(true);
          }
        }
      }

      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchFocused(false);
      }
      if (
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(target)
      ) {
        setIsMobileSearchOpen(false);
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();

    if (isBooksPage) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (query) {
          next.set("search", query);
        } else {
          next.delete("search");
        }
        next.delete("page");
        return next;
      });
    } else {
      if (query) {
        navigate(`/books?search=${encodeURIComponent(query)}`);
      } else {
        navigate("/books");
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (isBooksPage && urlSearchParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("search");
        next.delete("page");
        return next;
      });
    }
    searchInputRef.current?.focus();
    mobileSearchInputRef.current?.focus();
  };

  const handleSelectBook = (bookId: number) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    navigate(`/books/${bookId}`);
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

      {/* ---------------- GIỮA: Thanh Tìm Kiếm Toàn Cục (Desktop) ---------------- */}
      <div
        ref={searchContainerRef}
        className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2 relative"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full group flex items-center"
        >
          <button
            type="submit"
            aria-label="Tìm kiếm sách"
            className="absolute left-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:text-[#C89B3C] hover:bg-amber-50/80 transition-colors cursor-pointer"
          >
            <Search size={16} />
          </button>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Tìm kiếm sách, tác giả, ..."
            className="w-full rounded-xl border border-stone-200/90 bg-stone-50/80 py-2 pl-9 pr-20 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 transition-all duration-200 hover:border-amber-400/60 focus:bg-white focus:border-[#C89B3C] focus:outline-none focus:ring-3 focus:ring-[#C89B3C]/15"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Xóa nội dung tìm kiếm"
                className="rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
            {/* <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-400 shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </kbd> */}
          </div>
        </form>

        {/* Live Search Quick Preview Dropdown */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-stone-200 bg-white p-2.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 z-50">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
              <span className="text-xs font-semibold text-stone-700">
                Gợi ý sách nhanh
              </span>
              {isSearchLoading ? (
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Loader2 size={12} className="animate-spin text-[#C89B3C]" />
                  <span>Đang tìm...</span>
                </div>
              ) : (
                <span className="text-[11px] text-stone-400">
                  {previewBooks.length} kết quả
                </span>
              )}
            </div>

            <div className="mt-1.5 max-h-72 overflow-y-auto space-y-1">
              {isSearchLoading && previewBooks.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-stone-400 text-xs gap-2">
                  <Loader2 size={16} className="animate-spin text-[#C89B3C]" />
                  <span>Đang tìm kiếm sách trong thư viện...</span>
                </div>
              ) : previewBooks.length > 0 ? (
                previewBooks.map((book) => {
                  const available = book.quantity - book.borrowedQuantity > 0;
                  return (
                    <div
                      key={book.id}
                      onClick={() => handleSelectBook(book.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50/60 cursor-pointer transition-colors border border-transparent hover:border-amber-200/50"
                    >
                      <div className="h-11 w-8 rounded-md bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {book.coverImage ? (
                          <img
                            src={getMediaUrl(book.coverImage)}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={16} className="text-stone-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {book.title}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {book.author} • {book.category?.name || "Khác"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${available
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                      >
                        {available ? "Còn sách" : "Hết"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-stone-400">
                  Không tìm thấy cuốn sách nào khớp với từ khóa "{debouncedQuery}"
                </div>
              )}
            </div>

            <div className="mt-2 border-t border-stone-100 pt-2">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#8A5A1E] hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <span>Xem tất cả kết quả cho "{searchQuery}"</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- PHẢI: Thông báo + User Profile ---------------- */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Nút Tìm Kiếm cho Mobile */}
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen((prev) => !prev);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
          }}
          aria-label="Mở tìm kiếm"
          className="flex h-10 w-10 md:hidden items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50/60 text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50 cursor-pointer"
        >
          <Search size={18} />
        </button>
        {/* Nút Chuông Thông Báo */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-expanded={isNotificationsOpen}
            aria-label="Thông báo hệ thống"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50/60 text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50 cursor-pointer"
          >
            <Bell size={18} />
            {hasUnreadNotice && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#C89B3C] text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Thông Báo (Responsive max-w để tránh tràn màn hình mobile) */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 z-50">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#C89B3C]" />
                  <span className="text-sm font-semibold text-stone-900">Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {unreadCount} mới
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8A5A1E] hover:text-[#C89B3C] hover:underline cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <CheckCheck size={13} />
                    <span>Đọc tất cả</span>
                  </button>
                )}
              </div>

              {/* Danh sách thông báo */}
              <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
                {isNotificationsLoading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-stone-400 text-xs gap-2">
                    <Loader2 size={16} className="animate-spin text-[#C89B3C]" />
                    <span>Đang tải thông báo...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-stone-400">
                    <div className="h-10 w-10 rounded-full bg-stone-50 flex items-center justify-center mb-1.5 text-stone-300 border border-stone-100">
                      <Inbox size={20} />
                    </div>
                    <p className="text-xs font-semibold text-stone-700">
                      Bạn chưa có thông báo nào
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Các thông báo mượn trả và hạn sách sẽ xuất hiện tại đây
                    </p>
                  </div>
                ) : (
                  notifications.map((notice) => {
                    const visuals = getNotificationVisuals(notice.type);
                    return (
                      <div
                        key={notice.id}
                        onClick={() => handleNotificationClick(notice)}
                        className={`group block rounded-xl p-2.5 text-left transition-colors cursor-pointer border ${
                          notice.isRead
                            ? "bg-white hover:bg-stone-50 border-stone-100"
                            : "bg-amber-50/40 hover:bg-amber-50/80 border-amber-200/60 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200/60 ${visuals.badgeBg}`}
                          >
                            {visuals.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p
                                className={`text-xs truncate ${
                                  notice.isRead
                                    ? "font-semibold text-stone-800"
                                    : "font-bold text-stone-900"
                                }`}
                              >
                                {notice.title}
                              </p>
                              <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                                {formatRelativeTime(notice.createdAt)}
                              </span>
                            </div>

                            <p className="mt-0.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                              {notice.content}
                            </p>
                          </div>

                          {!notice.isRead && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#C89B3C] ring-2 ring-white shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
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
              className={`text-stone-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-stone-700" : ""
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

      {/* Mobile Search Overlay / Drawer */}
      {isMobileSearchOpen && (
        <div
          ref={mobileSearchContainerRef}
          className="md:hidden absolute top-[70px] left-0 right-0 bg-white border-b border-[#E6DFCE] p-3 shadow-xl z-40 animate-in slide-in-from-top-2 duration-150"
        >
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="submit"
              aria-label="Tìm kiếm sách"
              className="absolute left-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:text-[#C89B3C] cursor-pointer"
            >
              <Search size={16} />
            </button>
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sách, tác giả, ISBN..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-18 text-xs text-stone-800 placeholder:text-stone-400 outline-none focus:bg-white focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="px-2 py-1 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </form>

          {/* Quick results for mobile */}
          {debouncedQuery.length >= 1 && (
            <div className="mt-2.5 max-h-60 overflow-y-auto divide-y divide-stone-100 rounded-xl border border-stone-100 bg-stone-50/50 p-1">
              {isSearchLoading && previewBooks.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-xs text-stone-400 gap-1.5">
                  <Loader2 size={14} className="animate-spin text-[#C89B3C]" />
                  <span>Đang tìm kiếm...</span>
                </div>
              ) : previewBooks.length > 0 ? (
                <>
                  {previewBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleSelectBook(book.id)}
                      className="flex items-center gap-2.5 py-2 px-1.5 cursor-pointer hover:bg-white rounded-lg transition-colors"
                    >
                      <div className="h-9 w-7 rounded bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center border border-stone-200/60">
                        {book.coverImage ? (
                          <img
                            src={getMediaUrl(book.coverImage)}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={12} className="text-stone-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {book.title}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-1 text-xs font-semibold text-[#8A5A1E] hover:underline"
                    >
                      Xem tất cả kết quả
                    </button>
                  </div>
                </>
              ) : (
                <p className="py-3 text-center text-xs text-stone-400">
                  Không tìm thấy cuốn sách nào
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
