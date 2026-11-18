import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Lock,
  Unlock,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

import {
  useMember,
  useMemberBorrows,
  useUpdateMemberStatus,
} from "@/hooks/use-member";
import type { BorrowStatus } from "@/api/borrow.api";
import { getMediaUrl } from "@/lib/media";

const BORROW_ITEMS_PER_PAGE = 8;

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const memberId = Number(id);

  const [page, setPage] = useState(1);
  const [borrowStatus, setBorrowStatus] = useState<BorrowStatus | "">("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const {
    data: member,
    isLoading: isLoadingMember,
    isError: isMemberError,
  } = useMember(memberId);

  const {
    data: borrowHistoryData,
    isLoading: isLoadingBorrows,
  } = useMemberBorrows(memberId, {
    page,
    limit: BORROW_ITEMS_PER_PAGE,
    status: borrowStatus || undefined,
  });

  const updateStatusMutation = useUpdateMemberStatus();

  const borrows = borrowHistoryData?.data ?? [];
  const pagination = borrowHistoryData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalBorrowsCount = pagination?.total ?? 0;

  const handleConfirmToggleStatus = async () => {
    if (!member) return;

    setActionError("");
    setActionSuccess("");

    const actionText = member.isActive ? "khóa" : "mở khóa";

    try {
      await updateStatusMutation.mutateAsync({
        id: member.id,
        isActive: !member.isActive,
      });

      setIsConfirmModalOpen(false);
      setActionSuccess(`Đã ${actionText} tài khoản bạn đọc "${member.fullName || member.username}" thành công.`);
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật trạng thái bạn đọc:", error);
      let errorMsg = `Không thể ${actionText} tài khoản bạn đọc.`;
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setActionError(errorMsg);
      setIsConfirmModalOpen(false);
    }
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (status === "BORROWING") {
      if (isOverdue) {
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            Đang mượn (Quá hạn)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/70 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          <BookOpen className="h-3 w-3 text-blue-500" />
          Đang mượn
        </span>
      );
    }

    if (status === "RETURNED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Đã trả
        </span>
      );
    }

    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          <Clock className="h-3 w-3 text-amber-500" />
          Chờ duyệt
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
          <XCircle className="h-3 w-3 text-rose-400" />
          Bị từ chối
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        Đã hủy
      </span>
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getInitials = (name?: string | null, username = "BD") => {
    const target = name || username;
    const parts = target.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoadingMember) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-lg bg-gray-200" />
              <div className="h-4 w-72 rounded-md bg-gray-100" />
            </div>
          </div>
          <div className="h-9 w-36 rounded-xl bg-gray-200" />
        </div>

        {/* Skeleton Body */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-2 gap-4 lg:col-span-2 sm:grid-cols-4">
            <div className="h-32 rounded-2xl bg-gray-100" />
            <div className="h-32 rounded-2xl bg-gray-100" />
            <div className="h-32 rounded-2xl bg-gray-100" />
            <div className="h-32 rounded-2xl bg-gray-100" />
          </div>
        </div>

        <div className="h-96 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isMemberError || !member) {
    return (
      <div className="space-y-5">
        <Link
          to="/members"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition hover:text-amber-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách bạn đọc
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800 shadow-2xs">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-3 text-base font-bold text-rose-900">
            Không tìm thấy thông tin bạn đọc
          </h2>
          <p className="mt-1 text-xs text-rose-600">
            Tài khoản không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <div className="mt-4">
            <Link
              to="/members"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-rose-700"
            >
              <ArrowLeft size={14} />
              Về danh sách độc giả
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = member;
  const borrowingPercentage = Math.min((stats.borrowingCount / 5) * 100, 100);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Điều hướng */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/members"
            className="cursor-pointer inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-600 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900"
            title="Quay lại danh sách bạn đọc"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <Shield size={11} />
                Cộng đồng bạn đọc
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Chi Tiết Bạn Đọc
            </h1>
            <p className="text-xs text-gray-500">
              Tra cứu thông tin hồ sơ và toàn bộ lịch sử lưu thông sách
            </p>
          </div>
        </div>

        {/* Nút hành động Khóa / Mở khóa */}
        <button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={updateStatusMutation.isPending}
          className={`cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-2xs transition w-full sm:w-auto ${member.isActive
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
            }`}
        >
          {member.isActive ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Tạm khóa tài khoản</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              <span>Kích hoạt tài khoản</span>
            </>
          )}
        </button>
      </div>

      {/* Thông báo trạng thái (Alerts) */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="cursor-pointer text-emerald-600 hover:text-emerald-900"
            title="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="cursor-pointer text-rose-600 hover:text-rose-900"
            title="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Thẻ Thông Tin Bạn Đọc & 4 Thẻ KPIs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 sm:gap-6">
        {/* Khối Hồ sơ cá nhân (1 Cột) */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-start gap-4">
              {/* Avatar Chữ Cái */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-100 to-amber-200 text-lg font-bold text-amber-900 shadow-xs">
                {getInitials(member.fullName, member.username)}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base sm:text-lg font-bold text-gray-900">
                  {member.fullName || "Chưa cập nhật họ tên"}
                </h2>
                <p className="text-xs text-gray-400 font-mono">@{member.username}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-800">
                    {member.memberCode || `MB-${String(member.id).padStart(5, "0")}`}
                  </span>

                  {member.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Đã khóa
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chi tiết liên hệ */}
            <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-xs">
              <div className="flex items-center gap-2.5 text-gray-600">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{member.phone || "Chưa cập nhật số điện thoại"}</span>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span>Gia nhập: {formatDate(member.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <Shield className="h-4 w-4 shrink-0 text-gray-400" />
                <span>Vai trò: Bạn đọc thư viện</span>
              </div>
            </div>
          </div>

          {/* Hạn mức mượn sách */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">Hạn mức mượn</span>
              <span className="font-mono font-bold text-gray-900">
                {stats.borrowingCount} / 5 cuốn
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${stats.borrowingCount >= 5
                    ? "bg-rose-500"
                    : stats.borrowingCount >= 3
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                style={{ width: `${borrowingPercentage}%` }}
              />
            </div>
            {stats.borrowingCount >= 5 && (
              <p className="mt-1.5 text-[11px] font-medium text-rose-600">
                Đã đạt giới hạn mượn tối đa 5 cuốn.
              </p>
            )}
          </div>
        </div>

        {/* Khối Thống kê hoạt động (2 Cột) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:col-span-2">
          {/* 1. Tổng lượt mượn */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Tổng lượt mượn
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                {stats.totalBorrows}
              </div>
              <span className="text-[11px] text-gray-400">giao dịch từ trước đến nay</span>
            </div>
          </div>

          {/* 2. Đang mượn */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Đang mượn đọc
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
                {stats.borrowingCount}
              </div>
              <span className="text-[11px] text-gray-400">cuốn sách đang lưu hành</span>
            </div>
          </div>

          {/* 3. Quá hạn */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 shadow-2xs transition ${stats.overdueCount > 0
                ? "border-rose-300 bg-rose-50/40 text-rose-900"
                : "border-gray-200/80 bg-white"
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${stats.overdueCount > 0 ? "text-rose-700" : "text-gray-500"
                  }`}
              >
                Sách quá hạn
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${stats.overdueCount > 0
                    ? "bg-rose-100 text-rose-700 animate-pulse"
                    : "bg-gray-100 text-gray-400"
                  }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono ${stats.overdueCount > 0 ? "text-rose-700" : "text-gray-900"
                  }`}
              >
                {stats.overdueCount}
              </div>
              <span
                className={`text-[11px] ${stats.overdueCount > 0 ? "text-rose-600 font-medium" : "text-gray-400"
                  }`}
              >
                {stats.overdueCount > 0 ? "Cần hoàn trả tại quầy" : "Không có sách trễ hạn"}
              </span>
            </div>
          </div>

          {/* 4. Đã trả */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Đã trả thành công
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {stats.returnedCount}
              </div>
              <span className="text-[11px] text-gray-400">cuốn sách đã hoàn tất</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bảng Lịch Sử Mượn / Trả Sách */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        {/* Header bảng & Bộ lọc trạng thái */}
        <div className="flex flex-col gap-3 border-b border-gray-200/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Lịch Sử Mượn / Trả Sách
                </h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 font-mono">
                  {totalBorrowsCount}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Toàn bộ các phiếu mượn của bạn đọc được lưu trữ theo thời gian
              </p>
            </div>
          </div>

          {/* Dropdown Lọc trạng thái */}
          <div className="flex items-center gap-2">
            <select
              value={borrowStatus}
              onChange={(e) => {
                setBorrowStatus(e.target.value as BorrowStatus | "");
                setPage(1);
              }}
              aria-label="Lọc trạng thái phiếu mượn"
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs outline-none transition hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tất cả trạng thái phiếu</option>
              <option value="BORROWING">Đang mượn</option>
              <option value="RETURNED">Đã trả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Bảng Dữ Liệu Lưu Thông (Responsive Table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="min-w-[240px] px-5 py-3.5">Đầu sách</th>
                <th className="min-w-[120px] px-4 py-3.5 text-center">Ngày mượn</th>
                <th className="min-w-[120px] px-4 py-3.5 text-center">Hạn trả</th>
                <th className="min-w-[120px] px-4 py-3.5 text-center">Ngày trả</th>
                <th className="min-w-[130px] px-4 py-3.5 text-center">Trạng thái</th>
                <th className="min-w-[180px] px-5 py-3.5">Người xử lý / Ghi chú</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoadingBorrows ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Đang tải lịch sử mượn trả...</p>
                  </td>
                </tr>
              ) : borrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      Chưa có lịch sử mượn sách
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Bạn đọc này chưa thực hiện giao dịch nào hoặc không khớp với bộ lọc hiện tại.
                    </p>
                    {borrowStatus && (
                      <button
                        type="button"
                        onClick={() => setBorrowStatus("")}
                        className="cursor-pointer mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
                      >
                        <RotateCcw size={12} />
                        Xóa bộ lọc trạng thái
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                borrows.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-amber-50/20"
                  >
                    {/* Đầu sách */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {record.book.coverImage ? (
                          <img
                            src={getMediaUrl(record.book.coverImage)}
                            alt={record.book.title}
                            className="h-12 w-9 rounded-md object-cover shadow-2xs border border-gray-200/80 shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-gray-50 text-gray-400">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/books/${record.book.id}`}
                            className="group flex items-center gap-1 font-semibold text-gray-900 transition hover:text-amber-800"
                            title={record.book.title}
                          >
                            <span className="line-clamp-1">{record.book.title}</span>
                            <ArrowUpRight
                              size={13}
                              className="shrink-0 text-gray-400 transition group-hover:text-amber-800"
                            />
                          </Link>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            {record.book.author && (
                              <span>Tác giả: {record.book.author}</span>
                            )}
                            {record.book.isbn && (
                              <>
                                <span>•</span>
                                <span className="font-mono">ISBN: {record.book.isbn}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Ngày mượn */}
                    <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs text-gray-600">
                      {formatDate(record.borrowedAt)}
                    </td>

                    {/* Hạn trả */}
                    <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs">
                      <span
                        className={
                          record.isOverdue
                            ? "font-bold text-rose-600"
                            : "text-gray-600"
                        }
                      >
                        {formatDate(record.dueDate)}
                      </span>
                    </td>

                    {/* Ngày trả */}
                    <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs text-gray-600">
                      {formatDate(record.returnedAt)}
                    </td>

                    {/* Trạng thái phiếu */}
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      {getStatusBadge(record.status, record.isOverdue)}
                    </td>

                    {/* Người xử lý & Ghi chú */}
                    <td className="px-5 py-4 text-xs text-center">
                      {record.processedBy ? (
                        <div>
                          <div className="font-semibold text-gray-800">
                            {record.processedBy.fullName || record.processedBy.username}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            @{record.processedBy.username}
                          </div>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">—</span>
                      )}

                      {record.rejectReason && (
                        <p className="mt-1 text-rose-600 font-medium">
                          Từ chối: {record.rejectReason}
                        </p>
                      )}

                      {record.notes && (
                        <p className="mt-1 text-gray-500 italic">
                          Ghi chú: {record.notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200/80 bg-gray-50/50 px-5 py-3.5 sm:flex-row">
            <div className="text-xs text-gray-500">
              Trang <strong className="font-mono text-gray-900">{page}</strong> /{" "}
              <strong className="font-mono text-gray-900">{totalPages}</strong> (Tổng{" "}
              <strong className="font-mono text-gray-900">{totalBorrowsCount}</strong> phiếu mượn)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Trước
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal Xác Nhận Khóa / Mở Khóa Tài Khoản */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${member.isActive
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                  }`}
              >
                {member.isActive ? <Lock size={22} /> : <Unlock size={22} />}
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {member.isActive ? "Tạm khóa tài khoản bạn đọc" : "Kích hoạt lại tài khoản"}
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  {member.fullName || member.username} ({member.memberCode || `@${member.username}`})
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-gray-600 bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              {member.isActive ? (
                <>
                  Bạn có chắc chắn muốn <strong>tạm khóa</strong> tài khoản bạn đọc này?
                  <div className="mt-1.5 text-rose-600 font-medium">
                    • Bạn đọc sẽ không thể đăng nhập hoặc gửi yêu cầu mượn sách mới.<br />
                    • Các sách đang mượn vẫn cần được theo dõi và hoàn trả tại quầy.
                  </div>
                </>
              ) : (
                <>
                  Bạn có muốn <strong>kích hoạt lại</strong> tài khoản bạn đọc này?
                  <div className="mt-1.5 text-emerald-700 font-medium">
                    • Bạn đọc có thể đăng nhập bình thường và tiếp tục mượn sách nếu đủ điều kiện lưu thông.
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={updateStatusMutation.isPending}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmToggleStatus}
                disabled={updateStatusMutation.isPending}
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-2xs transition disabled:opacity-50 ${member.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : member.isActive ? (
                  <>
                    <Lock size={14} />
                    <span>Xác nhận khóa</span>
                  </>
                ) : (
                  <>
                    <Unlock size={14} />
                    <span>Xác nhận kích hoạt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
