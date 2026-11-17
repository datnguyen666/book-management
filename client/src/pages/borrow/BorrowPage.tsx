import { useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Plus,
  Check,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookmarkCheck,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import type {
  BorrowRecord,
  BorrowStatus,
  CreateBorrowRequest,
} from "@/api/borrow.api";
import {
  useApproveBorrow,
  useBorrows,
  useCreateBorrow,
  useRejectBorrow,
  useReturnBorrow,
} from "@/hooks/use-borrow";
import { CreateBorrowModal } from "./CreateBorrowModal";

const DEFAULT_LIMIT = 10;

function isOverdue(dueDate: string, status: BorrowStatus) {
  if (status !== "BORROWING") {
    return false;
  }

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

export function BorrowPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createMutation = useCreateBorrow();
  const approveMutation = useApproveBorrow();
  const rejectMutation = useRejectBorrow();
  const returnMutation = useReturnBorrow();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BorrowStatus | "">("");
  const [rejectTarget, setRejectTarget] = useState<BorrowRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("Sách hiện không thể bàn giao");
  const [rejectError, setRejectError] = useState("");

  const { data, isLoading, isError, isFetching } = useBorrows({
    page,
    limit: DEFAULT_LIMIT,
    search: search.trim() || undefined,
    status,
  });

  const borrows = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalRecords = pagination?.total ?? borrows.length;

  // Thống kê nhanh từ danh sách hiện tại
  const borrowingCount = useMemo(() => {
    return borrows.filter((b) => b.status === "BORROWING").length;
  }, [borrows]);

  const pendingCount = useMemo(() => {
    return borrows.filter((b) => b.status === "PENDING").length;
  }, [borrows]);

  const returnedCount = useMemo(() => {
    return borrows.filter((b) => b.status === "RETURNED").length;
  }, [borrows]);

  const handleCreateBorrow = async (createData: CreateBorrowRequest) => {
    try {
      await createMutation.mutateAsync(createData);
      setIsCreateOpen(false);
      setPage(1);
    } catch (error) {
      console.error("Lỗi khi tạo phiếu mượn:", error);
      throw error;
    }
  };

  const handleApprove = async (borrow: BorrowRecord) => {
    const memberName =
      borrow.member?.fullName || borrow.member?.username || "Bạn đọc";
    const memberCode = borrow.member?.memberCode
      ? ` (${borrow.member.memberCode})`
      : "";

    const confirmed = window.confirm(
      `Phê duyệt yêu cầu mượn cuốn "${borrow.book.title}" cho bạn đọc "${memberName}"${memberCode} và xác nhận bàn giao sách?`
    );

    if (!confirmed) return;

    try {
      await approveMutation.mutateAsync(borrow.id);
    } catch (error) {
      console.error("Lỗi khi phê duyệt mượn sách:", error);
    }
  };

  const handleOpenReject = (borrow: BorrowRecord) => {
    setRejectTarget(borrow);
    setRejectReason("Sách hiện không thể bàn giao");
    setRejectError("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    if (rejectReason.length > 500) {
      setRejectError("Lý do từ chối không được vượt quá 500 ký tự.");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason.trim() || undefined,
      });
      setRejectTarget(null);
    } catch (error: unknown) {
      console.error("Lỗi khi từ chối yêu cầu mượn:", error);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể từ chối yêu cầu.";
      setRejectError(message);
    }
  };

  const handleReturn = async (borrow: BorrowRecord) => {
    const memberName =
      borrow.member?.fullName || borrow.member?.username || "Bạn đọc";
    const confirmed = window.confirm(
      `Xác nhận bạn đọc "${memberName}" đã hoàn trả cuốn sách "${borrow.book.title}" vào thư viện?`
    );

    if (!confirmed) return;

    try {
      await returnMutation.mutateAsync(borrow.id);
    } catch (error) {
      console.error("Lỗi khi ghi nhận trả sách:", error);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const getInitials = (name?: string | null, username = "BD") => {
    const target = name || username;
    const parts = target.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
              <Shield size={12} />
              Hệ thống lưu thông tài liệu thư viện
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 font-heading">
            Quản lý lưu thông & Mượn trả
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi, phê duyệt yêu cầu trực tuyến và quản lý hồ sơ mượn trả sách trong toàn hệ thống thư viện.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black shrink-0"
        >
          <Plus size={16} />
          <span>Tạo phiếu mượn tại quầy</span>
        </button>
      </div>

      {/* Thẻ Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng phiếu mượn</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900 font-mono">{totalRecords}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookmarkCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đang lưu hành</p>
            <p className="mt-0.5 text-xl font-bold text-blue-700 font-mono">{borrowingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Chờ duyệt bàn giao</p>
            <p className="mt-0.5 text-xl font-bold text-amber-700 font-mono">{pendingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đã trả thành công</p>
            <p className="mt-0.5 text-xl font-bold text-emerald-700 font-mono">{returnedCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar Tìm Kiếm & Lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên bạn đọc, mã thẻ, tựa sách hoặc ISBN..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Lọc trạng thái */}
          <div className="w-full md:w-56">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as BorrowStatus | "");
                setPage(1);
              }}
              aria-label="Lọc theo trạng thái phiếu mượn"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (Pending)</option>
              <option value="BORROWING">Đang mượn (Borrowing)</option>
              <option value="RETURNED">Đã hoàn trả (Returned)</option>
              <option value="REJECTED">Bị từ chối (Rejected)</option>
              <option value="CANCELLED">Đã hủy (Cancelled)</option>
            </select>
          </div>
        </div>

        {/* Tóm tắt & Reset */}
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Hiển thị <strong className="text-gray-900">{borrows.length}</strong> / {totalRecords} bản ghi
          </span>

          {(search.trim() || status !== "") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={13} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="space-y-4">
            <div className="h-6 w-48 rounded-lg bg-gray-100 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full rounded-lg bg-gray-50 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle size={32} className="mx-auto text-red-500" />
          <p className="mt-2 text-sm font-semibold text-red-800">Không thể tải dữ liệu mượn sách</p>
          <p className="mt-1 text-xs text-red-600">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && borrows.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <BookOpen size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Không tìm thấy phiếu mượn nào</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
            {search || status
              ? "Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái."
              : "Hiện tại chưa có phiếu mượn nào trong hệ thống."}
          </p>
          {(search || status) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer mt-5 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
            >
              <RotateCcw size={13} />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      )}

      {/* Bảng Dữ Liệu Mượn Trả */}
      {!isLoading && !isError && borrows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="w-16 px-4 py-3.5 text-center">#ID</th>
                  <th className="min-w-[220px] px-6 py-3.5">Đầu sách</th>
                  <th className="min-w-[220px] px-6 py-3.5">Bạn đọc</th>
                  <th className="min-w-[120px] px-4 py-3.5 text-center">Ngày mượn</th>
                  <th className="min-w-[130px] px-4 py-3.5 text-center">Hạn trả</th>
                  <th className="min-w-[120px] px-4 py-3.5 text-center">Ngày trả</th>
                  <th className="min-w-[130px] px-4 py-3.5 text-center">Trạng thái</th>
                  <th className="min-w-[150px] px-5 py-3.5">Người xử lý</th>
                  <th className="min-w-[150px] px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {borrows.map((borrow) => {
                  const overdue = isOverdue(borrow.dueDate, borrow.status);

                  return (
                    <tr
                      key={borrow.id}
                      className="transition-colors hover:bg-amber-50/25"
                    >
                      {/* ID */}
                      <td className="px-4 py-4 text-center font-mono text-xs text-gray-400">
                        #{borrow.id}
                      </td>

                      {/* Book */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/books/${borrow.book.id}`}
                          className="font-semibold text-gray-900 hover:text-amber-700 transition flex items-center gap-1 group"
                          title={borrow.book.title}
                        >
                          <span className="line-clamp-1">{borrow.book.title}</span>
                          <ArrowUpRight size={13} className="shrink-0 text-gray-400 group-hover:text-amber-700 transition" />
                        </Link>
                        <div className="mt-0.5 font-mono text-xs text-gray-400">
                          ISBN: {borrow.book.isbn}
                        </div>
                      </td>

                      {/* Member */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                            {getInitials(borrow.member?.fullName, borrow.member?.username)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {borrow.member?.fullName || borrow.member?.username || "Chưa xác định"}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded-md">
                                {borrow.member?.memberCode || `MB-${String(borrow.memberId).padStart(5, "0")}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        {borrow.notes && (
                          <div className="mt-1 text-[11px] text-gray-500 italic max-w-xs truncate" title={borrow.notes}>
                            Ghi chú: {borrow.notes}
                          </div>
                        )}
                      </td>

                      {/* Borrowed At */}
                      <td className="px-4 py-4 text-center text-xs text-gray-600 font-mono">
                        {new Date(borrow.borrowedAt || borrow.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4 text-center text-xs whitespace-nowrap">
                        <div className={`font-mono ${overdue ? "font-bold text-rose-600" : "text-gray-700"}`}>
                          {new Date(borrow.dueDate).toLocaleDateString("vi-VN")}
                        </div>
                        {overdue && (
                          <span className="mt-0.5 inline-block font-semibold text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                            Quá hạn
                          </span>
                        )}
                      </td>

                      {/* Returned At */}
                      <td className="px-4 py-4 text-center text-xs text-gray-600 font-mono">
                        {borrow.returnedAt
                          ? new Date(borrow.returnedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {borrow.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Chờ duyệt
                          </span>
                        )}
                        {borrow.status === "BORROWING" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            Đang mượn
                          </span>
                        )}
                        {borrow.status === "RETURNED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Đã trả
                          </span>
                        )}
                        {borrow.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                            Bị từ chối
                          </span>
                        )}
                        {borrow.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                            Đã hủy
                          </span>
                        )}
                      </td>

                      {/* Processed By */}
                      <td className="px-5 py-4 text-xs">
                        {borrow.processedBy ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {borrow.processedBy.fullName || borrow.processedBy.username}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              @{borrow.processedBy.username}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa duyệt</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {borrow.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(borrow)}
                              disabled={approveMutation.isPending}
                              title="Duyệt & Bàn giao sách"
                              className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={13} />
                              <span>Duyệt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReject(borrow)}
                              disabled={rejectMutation.isPending}
                              title="Từ chối yêu cầu"
                              className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              <X size={13} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        )}

                        {borrow.status === "BORROWING" && (
                          <button
                            type="button"
                            disabled={returnMutation.isPending}
                            onClick={() => handleReturn(borrow)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <RotateCcw
                              size={13}
                              className={returnMutation.isPending ? "animate-spin" : ""}
                            />
                            <span>Nhận trả sách</span>
                          </button>
                        )}

                        {borrow.status === "RETURNED" && (
                          <span className="text-xs text-gray-400 font-medium">Đã hoàn tất</span>
                        )}

                        {(borrow.status === "REJECTED" || borrow.status === "CANCELLED") && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-3.5 sm:flex-row">
            <p className="text-xs text-gray-500">
              Trang <span className="font-semibold text-gray-900">{page}</span> /{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span> (Tổng cộng{" "}
              <span className="font-semibold text-gray-900">{totalRecords}</span> bản ghi)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || isFetching}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Phiếu Mượn Tại Quầy */}
      <CreateBorrowModal
        isOpen={isCreateOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBorrow}
      />

      {/* Modal Từ Chối Yêu Cầu Mượn */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-rose-50/50">
              <div className="flex items-center gap-2.5 text-rose-700">
                <AlertTriangle size={18} className="shrink-0" />
                <h3 className="font-bold text-gray-900 font-heading">Từ chối yêu cầu mượn</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={rejectMutation.isPending}
                className="cursor-pointer rounded-lg p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
              <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p>
                  Đầu sách: <strong className="text-gray-900">{rejectTarget.book.title}</strong>
                </p>
                <p>
                  Bạn đọc:{" "}
                  <strong className="text-gray-900">
                    {rejectTarget.member?.fullName || rejectTarget.member?.username || "Bạn đọc"}
                    {rejectTarget.member?.memberCode ? ` (${rejectTarget.member.memberCode})` : ""}
                  </strong>
                </p>
              </div>

              {rejectError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                  {rejectError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Lý do từ chối yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu mượn sách..."
                  disabled={rejectMutation.isPending}
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:bg-gray-50"
                />
                <p className="mt-1 text-right text-[11px] text-gray-400">
                  {rejectReason.length}/500 ký tự
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  disabled={rejectMutation.isPending}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
