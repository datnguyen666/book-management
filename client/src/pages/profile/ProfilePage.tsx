import { useEffect, useState } from "react";
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

export function ProfilePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);
  const [imgLoadError, setImgLoadError] = useState(false);

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
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-100" />
        <div className="h-72 rounded-2xl bg-gray-100" />
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

  const initials = getInitials(user.fullName, user.username);
  const avatarUrl = getMediaUrl(user.avatar);
  const shouldShowImage = avatarUrl && !imgLoadError;

  return (
    <div className="w-full space-y-6 pb-12">
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
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Hồ sơ tài khoản, vai trò và thông tin liên hệ của bạn trong hệ thống
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

      {/* Hero Banner Card Widescreen */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-amber-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="relative z-10 flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-7 sm:text-left">
            {/* Avatar lớn 112x112px */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-amber-400/80 bg-gray-800 shadow-xl sm:h-32 sm:w-32">
              {shouldShowImage ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  onError={() => setImgLoadError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-4xl font-extrabold text-amber-100 font-mono">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {user.fullName || user.username}
                </h2>
                {user.memberCode && (
                  <span className="rounded-md border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-300">
                    {user.memberCode}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-300 font-medium">
                {getRoleLabel(user.role)}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-medium text-emerald-300">
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

        {/* Lưới chi tiết tài khoản Widescreen (2 Cột rộng rãi) */}
        <div className="grid divide-y divide-gray-100 lg:grid-cols-2 lg:divide-y-0 lg:divide-x border-t border-gray-100">
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
              label="Vai trò"
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
              label="Ngày gia nhập thư viện"
              value={formatJoinedDate(user.createdAt)}
            />
            <ProfileDetailItem
              icon={CheckCircle2}
              label="Trạng thái tài khoản"
              value={user.isActive ? "Đang hoạt động bình thường" : "Đã bị tạm khóa"}
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
    <div className="flex items-start gap-4 p-5 sm:p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p
          className={`mt-1 text-sm sm:text-base font-semibold truncate ${isMuted
            ? "text-gray-400 italic font-normal text-sm"
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
