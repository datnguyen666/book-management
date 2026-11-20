import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Shield,
  UserRound,
  IdCard,
  BookOpen,
  ArrowUpRight,
  BookMarked,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar,
  AlertCircle,
  Crown,
  ShieldCheck,
  FolderOpen,
  Users,
  Coins,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getProfile } from "@/api/auth.api";
import type { BorrowRecord, BorrowStatus } from "@/api/borrow.api";
import { useAuthStore } from "@/store/auth.store";
import { useMyBorrows } from "@/hooks/use-borrow";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { getMediaUrl } from "@/lib/media";
import type { Role, User } from "@/types/auth";

function getInitials(fullName?: string, username?: string) {
  const source = (fullName || username || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function getRoleLabel(role: Role) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "STAFF") return "Nhân viên thư viện";
  return "Bạn đọc thư viện";
}

function formatJoinedDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

function getDueStatus(dueDateStr: string, status: BorrowStatus) {
  if (status !== "BORROWING") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: "overdue",
      label: `Quá hạn ${Math.abs(diffDays)} ngày`,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }
  if (diffDays === 0) {
    return {
      type: "today",
      label: "Hết hạn hôm nay",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  if (diffDays <= 3) {
    return {
      type: "warning",
      label: `Còn ${diffDays} ngày`,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    type: "normal",
    label: `Còn ${diffDays} ngày`,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export function ProfilePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);
  const [imgLoadError, setImgLoadError] = useState(false);

  // 1. Lấy thông tin cá nhân của người dùng hiện tại
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: getProfile,
  });

  const [prevAvatar, setPrevAvatar] = useState(user?.avatar);
  if (user?.avatar !== prevAvatar) {
    setPrevAvatar(user?.avatar);
    setImgLoadError(false);
  }

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  // Phân biệt chế độ hiển thị
  const isAdminOrStaff = user?.role === "ADMIN" || user?.role === "STAFF";

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-gray-200" />
        <div className="h-56 rounded-2xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-2xs">
          Không thể tải thông tin cá nhân. Vui lòng tải lại trang hoặc đăng nhập lại.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {isAdminOrStaff ? <ShieldCheck size={12} /> : <Shield size={12} />}
              {isAdminOrStaff ? "Hồ sơ quản trị & vận hành" : "Tài khoản cá nhân"}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl font-heading">
            {isAdminOrStaff ? "Hồ sơ quản trị viên" : "Thông tin cá nhân"}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            {isAdminOrStaff
              ? "Hồ sơ công vụ, phân quyền trách nhiệm và trung tâm điều hành thư viện"
              : "Hồ sơ tài khoản, thông tin nhận diện và các cuốn sách bạn đã mượn gần đây"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black active:scale-98 w-full sm:w-auto"
        >
          <Edit3 size={16} />
          <span>Cập nhật hồ sơ</span>
        </button>
      </div>

      {/* Phân nhánh giao diện theo vai trò */}
      {isAdminOrStaff ? (
        <AdminStaffProfileView
          user={user}
          imgLoadError={imgLoadError}
          onImgLoadError={() => setImgLoadError(true)}
        />
      ) : (
        <MemberProfileView
          user={user}
          imgLoadError={imgLoadError}
          onImgLoadError={() => setImgLoadError(true)}
        />
      )}
    </div>
  );
}

// =========================================================================
// GIAO DIỆN DÀNH CHO QUẢN TRỊ VIÊN & NHÂN VIÊN (ADMIN & STAFF)
// =========================================================================
function AdminStaffProfileView({
  user,
  imgLoadError,
  onImgLoadError,
}: {
  user: User;
  imgLoadError: boolean;
  onImgLoadError: () => void;
}) {
  const navigate = useNavigate();
  const isAdmin = user.role === "ADMIN";
  const initials = getInitials(user.fullName, user.username);
  const avatarUrl = getMediaUrl(user.avatar);
  const shouldShowImage = avatarUrl && !imgLoadError;

  // Lấy dữ liệu tổng quan thư viện
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();

  return (
    <div className="space-y-8">
      {/* 1. Hero Banner Quản Trị Cấp Cao */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-amber-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          {/* Trang trí nền mờ nhẹ */}
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
            {/* Avatar tròn lớn 112px viền vàng kim */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-amber-400/50 bg-gray-800 shadow-2xl sm:h-32 sm:w-32">
              {shouldShowImage ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  onError={onImgLoadError}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-4xl font-extrabold text-amber-100 font-mono">
                  {initials}
                </div>
              )}
            </div>

            {/* Thông tin định danh quản trị */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="text-2xl font-bold text-white sm:text-3xl font-heading">
                  {user.fullName || user.username}
                </h2>
                <span className="rounded-md border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-300">
                  @{user.username}
                </span>
              </div>

              {/* Chức danh hệ thống */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-3.5 py-1 text-xs font-semibold text-amber-200">
                  {isAdmin ? <Crown size={14} className="text-amber-300" /> : <Shield size={14} className="text-amber-300" />}
                  {isAdmin
                    ? "Quản trị viên tối cao (System Administrator)"
                    : "Nhân viên thủ thư (Library Operations Staff)"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user.isActive ? "Tài khoản đang hoạt động" : "Tài khoản tạm khóa"}
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {isAdmin
                  ? "Bạn nắm giữ toàn quyền quản trị hệ thống, giám sát luồng lưu thông, báo cáo tài sản thư viện và quản lý nhân sự."
                  : "Bạn phụ trách vận hành nghiệp vụ kho sách, hỗ trợ độc giả và duyệt các yêu cầu mượn trả tài liệu."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Băng Thống Kê Chỉ Số Nghiệp Vụ Nhanh (Operational Quick Metrics) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-amber-800" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 font-heading">
              Chỉ số điều hành thư viện
            </h3>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition hover:underline"
          >
            <span>Chi tiết bảng điều khiển</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OperationalMetricCard
            title="Tổng đầu sách"
            value={isLoadingSummary ? "..." : (summary?.totalBooks?.toLocaleString("vi-VN") ?? "0")}
            subtitle="Đầu sách hiện có"
            icon={BookOpen}
            color="amber"
          />
          <OperationalMetricCard
            title="Thể loại danh mục"
            value={isLoadingSummary ? "..." : (summary?.totalCategories?.toLocaleString("vi-VN") ?? "0")}
            subtitle="Chủ đề phân loại"
            icon={FolderOpen}
            color="sky"
          />
          <OperationalMetricCard
            title="Đang lưu hành"
            value={isLoadingSummary ? "..." : (summary?.currentlyBorrowed?.toLocaleString("vi-VN") ?? "0")}
            subtitle="Sách đang được mượn"
            icon={BookMarked}
            color="indigo"
          />
          <OperationalMetricCard
            title="Sách quá hạn"
            value={isLoadingSummary ? "..." : (summary?.overdue?.toLocaleString("vi-VN") ?? "0")}
            subtitle="Cần nhắc trả / xử lý"
            icon={AlertCircle}
            color="rose"
          />
        </div>
      </div>

      {/* 3. Lưới Nghiệp Vụ Cân Xứng (2 Khối Rộng Rãi - 12 Cột) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Khối Trái (6 Cột): Hồ Sơ Công Vụ & Nhận Diện Nhân Sự */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <IdCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Hồ sơ công vụ & Định danh
                </h3>
                <p className="text-xs text-gray-400">
                  Thông tin nhân sự và chức quyền được lưu trữ trên hệ thống
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <ProfileInfoRow
                icon={AtSign}
                label="Tên đăng nhập"
                value={`@${user.username}`}
                isMono
              />
              <ProfileInfoRow
                icon={UserRound}
                label="Họ và tên"
                value={user.fullName || "—"}
              />
              <ProfileInfoRow
                icon={Mail}
                label="Địa chỉ email công vụ"
                value={user.email}
              />
              <ProfileInfoRow
                icon={Phone}
                label="Số điện thoại liên hệ"
                value={user.phone || "Chưa cập nhật số điện thoại"}
                isMuted={!user.phone}
              />
              <ProfileInfoRow
                icon={Shield}
                label="Vai trò phân quyền"
                value={getRoleLabel(user.role)}
              />
              <ProfileInfoRow
                icon={CalendarDays}
                label="Ngày tham gia / Bổ nhiệm"
                value={formatJoinedDate(user.createdAt)}
              />
            </div>

            {/* Thẩm quyền hệ thống */}
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Phạm vi thẩm quyền công vụ
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80 leading-relaxed">
                    {isAdmin
                      ? "Toàn quyền quản trị nhân sự, cấu hình tài sản thư viện, quản trị kho sách và phê duyệt luồng lưu thông mượn trả."
                      : "Quản lý kho sách, tiếp nhận và kiểm tra phê duyệt yêu cầu mượn/trả sách của bạn đọc tại quầy và trực tuyến."}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 active:scale-98"
            >
              <Edit3 size={15} />
              <span>Chỉnh sửa thông tin hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Khối Phải (6 Cột): Trung Tâm Điều Hành & Lối Tắt Nghiệp Vụ */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Lối tắt điều hành nghiệp vụ
                </h3>
                <p className="text-xs text-gray-400">
                  Truy cập nhanh vào các phân hệ quản lý thư viện hàng ngày
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <AdminShortcutItem
                title="Quản lý Lưu thông & Mượn trả"
                description="Tạo phiếu tại quầy, duyệt yêu cầu trực tuyến, nhận trả sách"
                to="/borrows"
                icon={Clock}
                tag="Nghiệp vụ chính"
              />

              <AdminShortcutItem
                title="Quản lý Kho sách thư viện"
                description="Tra cứu, thêm mới sách, cập nhật số lượng nhập kho"
                to="/books"
                icon={BookOpen}
              />

              <AdminShortcutItem
                title="Quản lý Thể loại sách"
                description="Phân loại danh mục và chủ đề cho toàn bộ ấn phẩm"
                to="/categories"
                icon={FolderOpen}
              />

              {isAdmin && (
                <>
                  <AdminShortcutItem
                    title="Quản trị Nhân sự (Staff)"
                    description="Thêm nhân viên, gửi mail kích hoạt, phân quyền và tạm khóa"
                    to="/staff"
                    icon={Users}
                    tag="Admin only"
                    highlight
                  />

                  <AdminShortcutItem
                    title="Báo cáo Giá trị Tài sản"
                    description="Tính toán giá trị tài sản sách lưu kho, xuất file Excel / PDF"
                    to="/assets"
                    icon={Coins}
                    tag="Admin only"
                    highlight
                  />
                </>
              )}

              <AdminShortcutItem
                title="Bảng điều khiển Thống kê"
                description="Biểu đồ phân tích lưu lượng mượn trả và tăng trưởng sách"
                to="/dashboard"
                icon={BarChart3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// GIAO DIỆN DÀNH CHO BẠN ĐỌC (MEMBER - 2 CỘT HIỆN TẠI)
// =========================================================================
function MemberProfileView({
  user,
  imgLoadError,
  onImgLoadError,
}: {
  user: User;
  imgLoadError: boolean;
  onImgLoadError: () => void;
}) {
  const navigate = useNavigate();
  const initials = getInitials(user.fullName, user.username);
  const avatarUrl = getMediaUrl(user.avatar);
  const shouldShowImage = avatarUrl && !imgLoadError;

  // Lấy danh sách lịch sử mượn sách của người dùng
  const { data: myBorrowsData, isLoading: isLoadingBorrows } = useMyBorrows({
    page: 1,
    limit: 20,
  });

  const rawRecords = myBorrowsData?.data;
  const recentSuccessfulBorrows = useMemo(() => {
    if (!rawRecords) return [];
    return rawRecords
      .filter(
        (record) => record.status === "BORROWING" || record.status === "RETURNED",
      )
      .slice(0, 5);
  }, [rawRecords]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      {/* CỘT TRÁI (5 Cột): THẺ THÔNG TIN CÁ NHÂN CAO CẤP */}
      <div className="lg:col-span-5 space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          {/* Top Profile Card: Banner Gradient Thư Viện Sang Trọng */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 px-6 py-8 text-center text-white sm:px-8 sm:py-10">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Avatar tròn lớn 112px */}
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-amber-400/40 bg-gray-800 shadow-xl">
                {shouldShowImage ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    onError={onImgLoadError}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-3xl font-extrabold text-amber-100 font-mono">
                    {initials}
                  </div>
                )}
              </div>

              {/* Tên & Mã thẻ */}
              <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white font-heading">
                {user.fullName || user.username}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-mono text-gray-300">
                  @{user.username}
                </span>
                {user.memberCode && (
                  <span className="rounded-md border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-300">
                    {user.memberCode}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-500/20 px-3 py-0.5 text-xs font-medium text-amber-200">
                  <Shield size={12} />
                  {getRoleLabel(user.role)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user.isActive ? "Đang hoạt động" : "Tạm khóa"}
                </span>
              </div>
            </div>
          </div>

          {/* Danh sách thông tin chi tiết */}
          <div className="divide-y divide-gray-100 bg-white">
            <ProfileInfoRow
              icon={AtSign}
              label="Tên đăng nhập"
              value={`@${user.username}`}
              isMono
            />
            <ProfileInfoRow
              icon={UserRound}
              label="Họ và tên"
              value={user.fullName || "—"}
            />
            {user.memberCode && (
              <ProfileInfoRow
                icon={IdCard}
                label="Mã thẻ độc giả"
                value={user.memberCode}
                isMono
              />
            )}
            <ProfileInfoRow
              icon={Mail}
              label="Địa chỉ email"
              value={user.email}
            />
            <ProfileInfoRow
              icon={Phone}
              label="Số điện thoại"
              value={user.phone || "Chưa cập nhật số điện thoại"}
              isMuted={!user.phone}
            />
            <ProfileInfoRow
              icon={CalendarDays}
              label="Ngày tham gia"
              value={formatJoinedDate(user.createdAt)}
            />
          </div>

          {/* Nút Cập nhật dưới chân Card */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-5">
            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 active:scale-98"
            >
              <Edit3 size={15} />
              <span>Chỉnh sửa thông tin cá nhân</span>
            </button>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI (7 Cột): DANH SÁCH SÁCH MƯỢN GẦN ĐÂY */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-6">
          {/* Header Thẻ Sách Mượn */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 font-heading">
                    Sách mượn gần đây
                  </h2>
                  {recentSuccessfulBorrows.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      {recentSuccessfulBorrows.length} cuốn
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Các tựa sách bạn đã mượn thành công từ thư viện
                </p>
              </div>
            </div>

            <Link
              to="/my-borrows"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition hover:underline shrink-0"
            >
              <span>Xem toàn bộ lịch sử</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Nội dung danh sách sách */}
          {isLoadingBorrows ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="h-24 w-16 rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                    <div className="h-5 w-24 rounded-full bg-gray-200 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentSuccessfulBorrows.length === 0 ? (
            /* Trạng thái rỗng (Empty State) */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-amber-50/20 py-12 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-800 mb-3">
                <BookMarked size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-heading">
                Chưa có cuốn sách mượn thành công nào
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-md">
                Khi bạn gửi yêu cầu và nhận sách mượn thành công từ thủ thư, danh
                sách các tựa sách sẽ được lưu giữ tại đây.
              </p>
              <Link
                to="/books"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-900 active:scale-98"
              >
                <Sparkles size={14} />
                <span>Khám phá kho sách ngay</span>
              </Link>
            </div>
          ) : (
            /* Danh sách tối đa 5 cuốn sách mượn thành công */
            <div className="space-y-3.5">
              {recentSuccessfulBorrows.map((record) => (
                <RecentBorrowItem key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENT PHỤ TRỢ: THẺ CHỈ SỐ VẬN HÀNH THƯ VIỆN
// =========================================================================
function OperationalMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof BookOpen;
  color: "amber" | "sky" | "indigo" | "rose";
}) {
  const colorMap = {
    amber: {
      bg: "bg-amber-50/80",
      text: "text-amber-800",
      border: "border-amber-200/60",
    },
    sky: {
      bg: "bg-sky-50/80",
      text: "text-sky-700",
      border: "border-sky-200/60",
    },
    indigo: {
      bg: "bg-indigo-50/80",
      text: "text-indigo-700",
      border: "border-indigo-200/60",
    },
    rose: {
      bg: "bg-rose-50/80",
      text: "text-rose-700",
      border: "border-rose-200/60",
    },
  };

  const currentTheme = colorMap[color];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs transition hover:shadow-xs hover:border-gray-300">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text}`}
      >
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500">{title}</p>
        <p className="text-xl font-extrabold text-gray-900 tracking-tight font-heading mt-0.5">
          {value}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENT PHỤ TRỢ: PHÍM TẮT ĐIỀU HÀNH NGHIỆP VỤ (SHORTCUT)
// =========================================================================
function AdminShortcutItem({
  title,
  description,
  to,
  icon: Icon,
  tag,
  highlight = false,
}: {
  title: string;
  description: string;
  to: string;
  icon: typeof BookOpen;
  tag?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 active:scale-99 ${
        highlight
          ? "border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/50 hover:border-amber-300 hover:shadow-xs"
          : "border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/15 hover:shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            highlight
              ? "bg-amber-100 text-amber-800 group-hover:bg-amber-200/80"
              : "bg-gray-100 text-gray-700 group-hover:bg-amber-100 group-hover:text-amber-800"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-800 transition font-heading">
              {title}
            </h4>
            {tag && (
              <span className="rounded-md border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                {tag}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-2xs transition group-hover:border-amber-300 group-hover:bg-amber-50 group-hover:text-amber-800">
        <ArrowUpRight size={15} />
      </div>
    </Link>
  );
}

// =========================================================================
// COMPONENT PHỤ TRỢ: HÀNG THÔNG TIN CHI TIẾT
// =========================================================================
function ProfileInfoRow({
  icon: Icon,
  label,
  value,
  isMono = false,
  isMuted = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  isMono?: boolean;
  isMuted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4 sm:px-6 hover:bg-gray-50/60 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p
          className={`text-sm font-semibold truncate ${
            isMuted
              ? "text-gray-400 italic font-normal"
              : isMono
                ? "font-mono text-gray-900"
                : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENT PHỤ TRỢ: THẺ SÁCH MƯỢN GẦN ĐÂY
// =========================================================================
function RecentBorrowItem({ record }: { record: BorrowRecord }) {
  const [coverError, setCoverError] = useState(false);
  const book = record.book;
  const coverUrl = getMediaUrl(book?.coverImage);
  const isBorrowing = record.status === "BORROWING";
  const dueStatus = getDueStatus(record.dueDate, record.status);

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:border-amber-200 hover:shadow-md hover:bg-amber-50/15">
      {/* Ảnh bìa sách */}
      <div className="relative h-24 w-18 sm:h-28 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200/70 bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xs">
        {coverUrl && !coverError ? (
          <img
            src={coverUrl}
            alt={book?.title || "Book cover"}
            onError={() => setCoverError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-amber-800">
            <BookMarked size={22} className="opacity-75" />
            <span className="mt-1 line-clamp-2 text-[10px] font-bold leading-tight font-heading">
              {book?.title || "Sách"}
            </span>
          </div>
        )}
      </div>

      {/* Thông tin tựa sách & chi tiết */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {book?.category?.name && (
            <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              {book.category.name}
            </span>
          )}

          {/* Badge trạng thái mượn trả */}
          {isBorrowing ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
              <Clock size={11} />
              Đang mượn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 size={11} />
              Đã trả thành công
            </span>
          )}

          {dueStatus && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${dueStatus.color}`}
            >
              <AlertCircle size={10} />
              {dueStatus.label}
            </span>
          )}
        </div>

        {/* Tiêu đề sách */}
        <Link
          to={`/books/${book?.id}`}
          className="block font-heading text-base font-bold text-gray-900 group-hover:text-amber-800 transition line-clamp-1"
        >
          {book?.title}
        </Link>

        {/* Tác giả & ISBN */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>Tác giả: {book?.author || "Chưa rõ"}</span>
          <span className="text-gray-300">•</span>
          <span className="font-mono text-[11px] text-gray-400">
            ISBN: {book?.isbn}
          </span>
        </div>

        {/* Dòng mốc thời gian mượn trả */}
        <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <div className="inline-flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            <span>Mượn: {formatDate(record.borrowedAt)}</span>
          </div>

          {isBorrowing ? (
            <div className="inline-flex items-center gap-1 text-amber-800 font-medium">
              <Clock size={12} className="text-amber-600" />
              <span>Hạn trả: {formatDate(record.dueDate)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Đã trả: {formatDate(record.returnedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Nút xem chi tiết bên phải */}
      <div className="shrink-0 self-end sm:self-center">
        <Link
          to={`/books/${book?.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-2xs transition group-hover:border-amber-300 group-hover:bg-amber-50 group-hover:text-amber-800"
          title="Xem chi tiết cuốn sách"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
