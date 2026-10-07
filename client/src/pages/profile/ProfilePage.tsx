import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

function getInitials(fullName: string, username: string) {
  const source = fullName.trim() || username.trim();

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function getRoleLabel(role: "ADMIN" | "STAFF") {
  return role === "ADMIN" ? "Quản trị viên" : "Nhân viên thư viện";
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
      <div className="mx-auto max-w-[1080px] space-y-6">
        <div className="h-5 w-40 animate-pulse rounded bg-black/5" />
        <div className="h-20 w-72 animate-pulse rounded bg-black/5" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/60" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-[1080px] rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Không thể tải thông tin cá nhân.
      </div>
    );
  }

  const initials = getInitials(user.fullName, user.username);

  return (
    <div className="mx-auto max-w-[1080px] space-y-5 sm:space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-3xl font-semibold leading-tight sm:text-4xl"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "#12192B",
            }}
          >
            Thông tin cá nhân
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Thông tin tài khoản và hồ sơ hiện tại của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          style={{ backgroundColor: "#12192B" }}
        >
          <Edit3 size={16} />
          Cập nhật hồ sơ
        </button>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DFCE] bg-white">
        {/* Hero */}
        <div
          className="relative overflow-hidden px-5 py-8 text-white sm:px-10 sm:py-10"
          style={{ backgroundColor: "#12192B" }}
        >
          <div
            className="absolute -right-14 -top-24 h-64 w-64 rounded-full"
            style={{
              border: "1px solid rgba(184,134,59,0.28)",
              boxShadow: "0 0 0 36px rgba(255,255,255,0.015)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-2xl font-semibold sm:h-28 sm:w-28 sm:text-3xl"
              style={{
                color: "#E9B35A",
                border: "2px solid #B8863B",
                backgroundColor: "rgba(255,255,255,0.03)",
                fontFamily: "'Source Serif 4', serif",
              }}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <h2
                className="break-words text-2xl font-semibold sm:text-3xl"
                style={{ fontFamily: "'Source Serif 4', serif" }}
              >
                {user.fullName || user.username}
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {getRoleLabel(user.role)}
              </p>

              <div
                className="mt-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  color: "#78C59A",
                  backgroundColor: "rgba(63,107,68,0.20)",
                  border: "1px solid rgba(88,150,108,0.25)",
                }}
              >
                <CheckCircle2 size={13} className="shrink-0" />
                {user.isActive
                  ? "Tài khoản đang hoạt động"
                  : "Tài khoản không hoạt động"}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-2">
          <ProfileItem
            icon={AtSign}
            label="Tên đăng nhập"
            value={user.username}
          />
          <ProfileItem
            icon={UserRound}
            label="Họ và tên"
            value={user.fullName || "—"}
          />
          <ProfileItem icon={Mail} label="Địa chỉ email" value={user.email} />
          <ProfileItem
            icon={CalendarDays}
            label="Ngày tham gia"
            value={formatJoinedDate(user.createdAt)}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#EEE8DB] px-5 py-5 last:border-b-0 sm:gap-4 sm:px-8 sm:py-7 md:nth-[3]:border-b-0">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11"
        style={{
          backgroundColor: "#FFF8E8",
          color: "#B8863B",
          border: "1px solid #EFD9A7",
        }}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-gray-900 sm:break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
