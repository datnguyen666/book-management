import { useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { getMediaUrl } from "@/lib/media";
import type { Role } from "@/types/auth";

function getInitials(fullName?: string, username?: string) {
  const source = (fullName || username || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function getRoleLabel(role: Role) {
  if (role === "ADMIN") return "Quản trị viên (Admin)";
  if (role === "STAFF") return "Nhân viên thư viện (Staff)";
  return "Bạn đọc thư viện (Member)";
}

function formatJoinedDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function ProfilePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
        <div className="h-9 w-52 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-2xs">
          Không thể tải thông tin cá nhân. Vui lòng tải lại trang hoặc đăng nhập lại.
        </div>
      </div>
    );
  }

  const initials = getInitials(user.fullName, user.username);
  const avatarUrl = getMediaUrl(user.avatar);

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              <Shield size={12} />
              Tài khoản cá nhân
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Thông tin cá nhân
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Hồ sơ tài khoản, vai trò và thông tin liên hệ của bạn trong hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-black active:scale-98 w-full sm:w-auto"
        >
          <Edit3 size={15} />
          <span>Cập nhật hồ sơ</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-amber-950 px-6 py-8 text-white sm:px-10 sm:py-9">
          <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            {/* Avatar lớn */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-3 border-amber-400/80 bg-gray-800 shadow-lg sm:h-28 sm:w-28">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName || user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-3xl font-extrabold text-amber-100 sm:text-4xl font-mono">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {user.fullName || user.username}
                </h2>
                {user.memberCode && (
                  <span className="rounded-md border border-amber-300/40 bg-amber-400/20 px-2 py-0.5 font-mono text-xs font-semibold text-amber-300">
                    {user.memberCode}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-gray-300">
                {getRoleLabel(user.role)}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user.isActive ? "Tài khoản đang hoạt động" : "Tài khoản tạm khóa"}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  @{user.username}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x border-t border-gray-100">
          <div className="divide-y divide-gray-100">
            <ProfileDetailItem
              icon={AtSign}
              label="Tên đăng nhập"
              value={user.username}
              isMono
            />
            <ProfileDetailItem
              icon={UserRound}
              label="Họ và tên"
              value={user.fullName || "—"}
            />
            {user.memberCode && (
              <ProfileDetailItem
                icon={IdCard}
                label="Mã thẻ độc giả"
                value={user.memberCode}
                isMono
              />
            )}
            <ProfileDetailItem
              icon={Shield}
              label="Vai trò tài khoản"
              value={getRoleLabel(user.role)}
            />
          </div>

          <div className="divide-y divide-gray-100">
            <ProfileDetailItem
              icon={Mail}
              label="Địa chỉ email"
              value={user.email}
            />
            <ProfileDetailItem
              icon={Phone}
              label="Số điện thoại"
              value={user.phone || "Chưa cập nhật số điện thoại"}
              isMuted={!user.phone}
            />
            <ProfileDetailItem
              icon={CalendarDays}
              label="Ngày gia nhập"
              value={formatJoinedDate(user.createdAt)}
            />
            <ProfileDetailItem
              icon={CheckCircle2}
              label="Trạng thái tài khoản"
              value={user.isActive ? "Đang hoạt động" : "Bị khóa"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileDetailItem({
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
    <div className="flex items-start gap-3.5 p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p
          className={`mt-1 text-sm font-semibold truncate ${
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
