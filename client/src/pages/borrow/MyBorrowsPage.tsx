import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { BorrowRecord, BorrowStatus } from "@/api/borrow.api";
import { useCancelBorrow, useMyBorrows, useRenewBorrow } from "@/hooks/use-borrow";
import { getMediaUrl } from "@/lib/media";

const DEFAULT_LIMIT = 8;

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
      color: "bg-red-50 text-red-700 border-red-200",
    };
  }
  if (diffDays === 0) {
    return {
      type: "today",
      label: "Hết hạn hôm nay",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (diffDays <= 3) {
    return {
      type: "warning",
      label: `Còn ${diffDays} ngày (sắp đến hạn)`,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    type: "normal",
    label: `Còn ${diffDays} ngày`,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export function MyBorrowsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"ALL" | "BORROWING" | "PENDING" | "HISTORY">("ALL");
  const [search, setSearch] = useState("");

  const statusFilter: BorrowStatus | "" = useMemo(() => {
    if (activeTab === "BORROWING") return "BORROWING";
    if (activeTab === "PENDING") return "PENDING";
    return "";
  }, [activeTab]);

  const { data, isLoading } = useMyBorrows({
    page,
    limit: DEFAULT_LIMIT,
    search: search.trim() || undefined,
    status: statusFilter,
  });

  const cancelMutation = useCancelBorrow();
  const renewMutation = useRenewBorrow();

  const allRecords = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Filter history tab records locally if tab is HISTORY
  const displayedRecords = useMemo(() => {
    if (activeTab === "HISTORY") {
      return allRecords.filter(
        (r) => r.status === "RETURNED" || r.status === "REJECTED" || r.status === "CANCELLED",
      );
    }
    return allRecords;
  }, [allRecords, activeTab]);

  // Compute metrics
  const activeCount = allRecords.filter((r) => r.status === "BORROWING").length;
  const pendingCount = allRecords.filter((r) => r.status === "PENDING").length;
  const returnedCount = allRecords.filter((r) => r.status === "RETURNED").length;

  const handleCancel = async (borrow: BorrowRecord) => {
    const ok = window.confirm(
      `Bạn có chắc chắn muốn hủy yêu cầu mượn cuốn sách "${borrow.book.title}"?`,
    );
    if (!ok) return;

    try {
      await cancelMutation.mutateAsync(borrow.id);
      window.alert("Đã hủy yêu cầu mượn sách thành công.");
    } catch (err: any) {
      console.error(err);
      window.alert(err.response?.data?.message || "Không thể hủy yêu cầu.");
    }
  };

  const handleRenew = async (borrow: BorrowRecord) => {
    const ok = window.confirm(
      `Gia hạn thêm 14 ngày cho cuốn sách "${borrow.book.title}"? (Lưu ý: Chỉ được gia hạn tối đa 1 lần)`,
    );
    if (!ok) return;

    try {
      await renewMutation.mutateAsync(borrow.id);
      window.alert("Gia hạn mượn sách thành công thêm 14 ngày!");
    } catch (err: any) {
      console.error(err);
      window.alert(err.response?.data?.message || "Gia hạn không thành công.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            Tủ sách của tôi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi sách đang mượn, yêu cầu chờ duyệt và lịch sử mượn trả của bạn
          </p>
        </div>

        <Link
          to="/books"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3b2410] to-[#7a4b1e] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-95 self-start"
        >
          <BookOpen size={16} />
          <span>Tìm & Mượn sách mới</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Đang mượn */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Đang mượn
            </span>
            <span className="rounded-full bg-blue-100 p-2 text-blue-700">
              <BookOpen size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
            <span className="text-xs text-gray-500">/ 5 cuốn tối đa</span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            {5 - activeCount > 0
              ? `Bạn có thể mượn thêm ${5 - activeCount} cuốn`
              : "Đã đạt số lượng mượn tối đa"}
          </p>
        </div>

        {/* Card 2: Chờ duyệt */}
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Chờ thư viện duyệt
            </span>
            <span className="rounded-full bg-amber-100 p-2 text-amber-800">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <p className="mt-1 text-xs text-amber-700">
            {pendingCount > 0
              ? "Vui lòng đến thư viện nhận sách sau khi được duyệt"
              : "Không có yêu cầu chờ xử lý"}
          </p>
        </div>

        {/* Card 3: Đã hoàn trả */}
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Sách đã hoàn trả
            </span>
            <span className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle size={18} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-gray-900">{returnedCount}</p>
          </div>
          <p className="mt-1 text-xs text-emerald-600">
            Cảm ơn bạn đã luôn trả sách đúng hẹn
          </p>
        </div>
      </div>

      {/* Tabs and Search filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ALL");
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === "ALL"
                ? "bg-[#8A5A1E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("BORROWING");
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === "BORROWING"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Đang mượn
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("PENDING");
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === "PENDING"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Chờ duyệt
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("HISTORY");
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === "HISTORY"
                ? "bg-gray-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Lịch sử mượn
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên sách, ISBN..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
          Đang tải danh sách mượn sách...
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Chưa có phiếu mượn nào trong mục này
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Khám phá kho sách phong phú của thư viện và chọn cuốn sách bạn yêu thích để bắt đầu mượn đọc.
          </p>
          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 rounded-lg bg-[#8A5A1E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#724814]"
            >
              Khám phá sách ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayedRecords.map((record) => {
            const dueInfo = getDueStatus(record.dueDate, record.status);

            return (
              <div
                key={record.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-300 transition duration-200"
              >
                <div className="flex gap-4">
                  {/* Cover */}
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                    {record.book.coverImage ? (
                      <img
                        src={getMediaUrl(record.book.coverImage)}
                        alt={record.book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <BookOpen size={28} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className="truncate font-semibold text-gray-900 text-base"
                        title={record.book.title}
                      >
                        {record.book.title}
                      </h4>

                      {/* Status Badge */}
                      {record.status === "PENDING" && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Chờ duyệt
                        </span>
                      )}
                      {record.status === "BORROWING" && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Đang mượn
                        </span>
                      )}
                      {record.status === "RETURNED" && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Đã trả
                        </span>
                      )}
                      {record.status === "REJECTED" && (
                        <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          Bị từ chối
                        </span>
                      )}
                      {record.status === "CANCELLED" && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Đã hủy
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Tác giả: <span className="text-gray-700 font-medium">{record.book.author || "—"}</span>
                    </p>

                    {/* Timeline dates */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>Ngày mượn: {new Date(record.borrowedAt || record.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span>Hạn trả: <strong>{new Date(record.dueDate).toLocaleDateString()}</strong></span>
                      </div>

                      {record.returnedAt && (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle size={13} />
                          <span>Đã trả ngày: {new Date(record.returnedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Warning Badge */}
                    {dueInfo && (
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${dueInfo.color}`}
                      >
                        <AlertCircle size={13} />
                        <span>{dueInfo.label}</span>
                      </div>
                    )}

                    {/* Reject reason or note */}
                    {record.rejectReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                        Lý do từ chối: {record.rejectReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="text-xs text-gray-400">
                    Mã phiếu: #{record.id}
                    {record.renewCount > 0 && (
                      <span className="ml-2 font-medium text-blue-600">
                        • Đã gia hạn ({record.renewCount}/1)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Member Cancel Action */}
                    {record.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(record)}
                        disabled={cancelMutation.isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Hủy yêu cầu
                      </button>
                    )}

                    {/* Member Renew Action */}
                    {record.status === "BORROWING" && (
                      <button
                        type="button"
                        onClick={() => handleRenew(record)}
                        disabled={
                          renewMutation.isPending ||
                          record.renewCount >= 1 ||
                          new Date(record.dueDate) < new Date()
                        }
                        title={
                          record.renewCount >= 1
                            ? "Đã gia hạn tối đa"
                            : new Date(record.dueDate) < new Date()
                            ? "Sách đã quá hạn, vui lòng trả tại quầy"
                            : "Gia hạn thêm 14 ngày"
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8863B] px-3 py-1.5 text-xs font-medium text-[#8A5A1E] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                      >
                        <RotateCcw size={13} />
                        <span>
                          {record.renewCount >= 1 ? "Đã gia hạn" : "Gia hạn (+14 ngày)"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Trang {pagination?.page} / {totalPages} (Tổng {pagination?.total} bản ghi)
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
