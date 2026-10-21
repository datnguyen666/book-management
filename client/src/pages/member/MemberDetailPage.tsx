import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  UserCheck,
  UserX,
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

  const handleToggleStatus = async () => {
    if (!member) return;

    const actionText = member.isActive ? "khóa" : "mở khóa";
    const confirmMessage = member.isActive
      ? `Bạn có chắc chắn muốn KHÓA tài khoản của bạn đọc "${member.fullName || member.username}"?\nSau khi khóa, bạn đọc sẽ không thể đăng nhập hoặc yêu cầu mượn sách mới.`
      : `Bạn có muốn MỞ KHÓA tài khoản cho bạn đọc "${member.fullName || member.username}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: member.id,
        isActive: !member.isActive,
      });
      window.alert(`Đã ${actionText} tài khoản bạn đọc thành công.`);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái bạn đọc:", error);
      window.alert(
        error.response?.data?.message ||
        `Không thể ${actionText} tài khoản bạn đọc.`,
      );
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
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          <BookOpen className="h-3 w-3 text-blue-500" />
          Đang mượn
        </span>
      );
    }

    if (status === "RETURNED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Đã trả
        </span>
      );
    }

    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
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
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        Đã hủy
      </span>
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (isLoadingMember) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8A5A1E] border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải hồ sơ bạn đọc...</p>
        </div>
      </div>
    );
  }

  if (isMemberError || !member) {
    return (
      <div className="space-y-4">
        <Link
          to="/members"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách bạn đọc
        </Link>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
          <p className="mt-3 text-base font-semibold">
            Không tìm thấy thông tin bạn đọc
          </p>
          <p className="mt-1 text-xs text-rose-600">
            Tài khoản không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
        </div>
      </div>
    );
  }

  const { stats } = member;

  return (
    <div className="space-y-6 pb-16">
      {/* Nút quay lại & Tiêu đề */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/members"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold"
              style={{ fontFamily: "'Source Serif 4', serif", color: "#12192B" }}>
              Hồ sơ Bạn đọc
            </h1>
            <p className="text-xs text-slate-500">
              Chi tiết thông tin cá nhân và lịch sử mượn/trả sách tại thư viện.
            </p>
          </div>
        </div>

        {/* Nút hành động nhanh: Khóa / Mở khóa */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={updateStatusMutation.isPending}
          className={`inline-flex items-center gap-1.5 self-start rounded-lg border px-3.5 py-2 text-sm font-medium shadow-xs transition sm:self-auto ${member.isActive
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/80"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
            }`}
        >
          {member.isActive ? (
            <>
              <Lock className="h-4 w-4" />
              Khóa tài khoản
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Mở khóa tài khoản
            </>
          )}
        </button>
      </div>

      {/* Card Thông tin bạn đọc & Chỉ số thống kê */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Khối hồ sơ cá nhân (1 cột) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Avatar chữ cái */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#B8863B]/30 bg-gradient-to-br from-[#B8863B]/20 to-[#8A5A1E]/20 font-serif text-xl font-bold text-[#8A5A1E]">
              {(member.fullName || member.username).charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-slate-900">
                {member.fullName || "Chưa cập nhật họ tên"}
              </h2>
              <p className="text-xs text-slate-400">@{member.username}</p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {member.memberCode && (
                  <span className="rounded-md border border-[#B8863B]/30 bg-[#B8863B]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#8A5A1E]">
                    {member.memberCode}
                  </span>
                )}
                {member.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <UserCheck className="h-3 w-3" />
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                    <UserX className="h-3 w-3" />
                    Đã bị khóa
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết liên hệ & ngày tham gia */}
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{member.email}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{member.phone || "Chưa cập nhật số điện thoại"}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Ngày tham gia: {formatDate(member.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <Shield className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Vai trò: Bạn đọc (Member)</span>
            </div>
          </div>
        </div>

        {/* Khối Thống kê hoạt động mượn (2 cột) */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 sm:grid-cols-4">
          {/* Tổng lượt mượn */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Tổng lượt mượn
              </span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-bold text-slate-900">
                {stats.totalBorrows}
              </span>
              <span className="ml-1 text-xs text-slate-400">lần</span>
            </div>
          </div>

          {/* Đang giữ sách */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Đang mượn
              </span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-bold text-blue-700">
                {stats.borrowingCount}
              </span>
              <span className="ml-1 text-xs text-slate-400">cuốn</span>
            </div>
          </div>

          {/* Quá hạn */}
          <div
            className={`flex flex-col justify-between rounded-xl border p-5 shadow-sm ${stats.overdueCount > 0
              ? "border-rose-300 bg-rose-50/40"
              : "border-slate-200 bg-white"
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium uppercase tracking-wider ${stats.overdueCount > 0 ? "text-rose-700" : "text-slate-500"
                  }`}
              >
                Quá hạn
              </span>
              <div
                className={`rounded-lg p-2 ${stats.overdueCount > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-400"
                  }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`font-serif text-3xl font-bold ${stats.overdueCount > 0 ? "text-rose-700" : "text-slate-900"
                  }`}
              >
                {stats.overdueCount}
              </span>
              <span className="ml-1 text-xs text-slate-400">cuốn</span>
            </div>
          </div>

          {/* Đã trả */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Đã trả
              </span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-bold text-emerald-700">
                {stats.returnedCount}
              </span>
              <span className="ml-1 text-xs text-slate-400">cuốn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Lịch sử Mượn Sách */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header bảng & Bộ lọc trạng thái */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#8A5A1E]" />
            <h3 className="font-serif text-base font-bold text-slate-900">
              Lịch sử Mượn / Trả Sách
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {totalBorrowsCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={borrowStatus}
              onChange={(e) => {
                setBorrowStatus(e.target.value as BorrowStatus | "");
                setPage(1);
              }}
              aria-label="Lọc trạng thái phiếu mượn"
              className="rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:border-[#C89B3C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30"
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

        {/* Nội dung bảng */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sách</th>
                <th className="px-5 py-3.5 font-semibold">Ngày mượn</th>
                <th className="px-5 py-3.5 font-semibold">Hạn trả</th>
                <th className="px-5 py-3.5 font-semibold">Ngày trả</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold">Người xử lý / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingBorrows ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#8A5A1E] border-t-transparent" />
                    <p className="mt-2 text-xs text-slate-400">Đang tải lịch sử mượn...</p>
                  </td>
                </tr>
              ) : borrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <BookOpen className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-2 font-medium text-slate-700">
                      Chưa có lịch sử mượn sách
                    </p>
                    <p className="text-xs text-slate-400">
                      Bạn đọc này chưa thực hiện giao dịch mượn nào hoặc không khớp bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                borrows.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    {/* Thông tin sách */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {record.book.coverImage ? (
                          <img
                            src={getMediaUrl(record.book.coverImage)}
                            alt={record.book.title}
                            className="h-12 w-9 rounded object-cover shadow-xs border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-12 w-9 items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-400">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/books/${record.book.id}`}
                            className="font-medium text-slate-900 transition hover:text-[#8A5A1E]"
                          >
                            {record.book.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Tác giả: {record.book.author}</span>
                            <span>•</span>
                            <span className="font-mono">ISBN: {record.book.isbn}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Ngày mượn */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                      {formatDate(record.borrowedAt)}
                    </td>

                    {/* Hạn trả */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium">
                      <span
                        className={
                          record.isOverdue
                            ? "font-semibold text-rose-600"
                            : "text-slate-600"
                        }
                      >
                        {formatDate(record.dueDate)}
                      </span>
                    </td>

                    {/* Ngày trả */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                      {formatDate(record.returnedAt)}
                    </td>

                    {/* Trạng thái phiếu */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {getStatusBadge(record.status, record.isOverdue)}
                    </td>

                    {/* Người xử lý & Ghi chú */}
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {record.processedBy ? (
                        <div className="font-medium text-slate-700">
                          {record.processedBy.fullName || record.processedBy.username}
                        </div>
                      ) : (
                        <span className="italic text-slate-400">-</span>
                      )}

                      {record.rejectReason && (
                        <p className="mt-0.5 text-rose-600">
                          Lý do từ chối: {record.rejectReason}
                        </p>
                      )}

                      {record.notes && (
                        <p className="mt-0.5 italic text-slate-400">
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

        {/* Phân trang lịch sử mượn */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-3 sm:flex-row">
            <div className="text-xs text-slate-500">
              Trang <span className="font-medium text-slate-900">{page}</span> /{" "}
              <span className="font-medium text-slate-900">{totalPages}</span> (Tổng{" "}
              <span className="font-medium text-slate-900">{totalBorrowsCount}</span> phiếu)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Trước
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
