import { useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Search,
  Bookmark,
  X,
  ArrowUpRight,
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

  const allRecords = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Lọc lịch sử nếu đang ở tab HISTORY
  const displayedRecords = useMemo(() => {
    if (activeTab === "HISTORY") {
      return allRecords.filter(
        (r) => r.status === "RETURNED" || r.status === "REJECTED" || r.status === "CANCELLED"
      );
    }
    return allRecords;
  }, [allRecords, activeTab]);

  // Thống kê nhanh
  const activeCount = useMemo(() => allRecords.filter((r) => r.status === "BORROWING").length, [allRecords]);
  const pendingCount = useMemo(() => allRecords.filter((r) => r.status === "PENDING").length, [allRecords]);
  const returnedCount = useMemo(() => allRecords.filter((r) => r.status === "RETURNED").length, [allRecords]);

  const handleCancel = async (borrow: BorrowRecord) => {
    const ok = window.confirm(
      `Bạn có chắc chắn muốn hủy yêu cầu mượn cuốn sách "${borrow.book.title}"?`
    );
    if (!ok) return;

    try {
      await cancelMutation.mutateAsync(borrow.id);
    } catch (err: unknown) {
      console.error("Lỗi khi hủy yêu cầu:", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Không thể hủy yêu cầu mượn.";
      window.alert(message);
    }
  };

  const handleRenew = async (borrow: BorrowRecord) => {
    const ok = window.confirm(
      `Gia hạn thêm 14 ngày cho cuốn sách "${borrow.book.title}"?\nLưu ý: Mỗi cuốn sách chỉ được gia hạn tối đa 1 lần.`
    );
    if (!ok) return;

    try {
      await renewMutation.mutateAsync(borrow.id);
    } catch (err: unknown) {
      console.error("Lỗi khi gia hạn sách:", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Gia hạn không thành công.";
      window.alert(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">
              <Bookmark size={12} />
              Tủ sách cá nhân của bạn
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 font-heading">
            Tủ sách của tôi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi sách đang mượn, yêu cầu chờ duyệt và toàn bộ lịch sử đọc sách của bạn.
          </p>
        </div>

        <Link
          to="/books"
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black self-start sm:self-auto shrink-0"
        >
          <BookOpen size={16} />
          <span>Tìm & Mượn sách mới</span>
        </Link>
      </div>

      {/* Thẻ Chỉ Số Cá Nhân (Metrics Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Đang mượn */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Đang mượn đọc
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 font-mono">{activeCount}</p>
            <span className="text-xs text-gray-400 font-mono">/ 5 cuốn tối đa</span>
          </div>
          {/* Thanh tiến độ */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(activeCount / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 font-medium">
            {5 - activeCount > 0
              ? `Bạn có thể mượn thêm ${5 - activeCount} cuốn sách nữa`
              : "Bạn đã đạt hạn ngạch tối đa 5 cuốn"}
          </p>
        </div>

        {/* Card 2: Chờ duyệt */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Chờ thư viện duyệt
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 font-mono">{pendingCount}</p>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            {pendingCount > 0
              ? "Vui lòng tới quầy thư viện nhận sách sau khi được duyệt."
              : "Hiện không có yêu cầu nào đang chờ xử lý."}
          </p>
        </div>

        {/* Card 3: Đã hoàn trả */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Sách đã hoàn trả
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 font-mono">{returnedCount}</p>
          </div>
          <p className="text-xs text-emerald-700">
            Cảm ơn bạn đã luôn giữ gìn tài liệu và trả sách đúng hẹn!
          </p>
        </div>
      </div>

      {/* Tabs & Thanh Tìm Kiếm */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-gray-100/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ALL");
              setPage(1);
            }}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "ALL"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
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
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "BORROWING"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
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
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "PENDING"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
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
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "HISTORY"
                ? "bg-gray-800 text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Lịch sử mượn
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-72">
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
            placeholder="Tìm theo tên sách, ISBN..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-xs text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center text-sm text-gray-500 shadow-2xs">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <p className="mt-2 text-xs text-gray-400">Đang tải danh sách mượn sách...</p>
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Chưa có phiếu mượn nào trong mục này
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Khám phá kho sách phong phú của thư viện và chọn cuốn sách bạn yêu thích để bắt đầu hành trình đọc sách.
          </p>
          <div className="pt-2">
            <Link
              to="/books"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-black"
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
                className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-amber-300 transition duration-200"
              >
                <div className="flex gap-4">
                  {/* Bìa sách */}
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100 shadow-2xs">
                    {record.book.coverImage ? (
                      <img
                        src={getMediaUrl(record.book.coverImage)}
                        alt={record.book.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <BookOpen size={28} />
                      </div>
                    )}
                  </div>

                  {/* Thông tin sách */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/books/${record.book.id}`}
                        className="truncate font-bold text-gray-900 text-sm hover:text-amber-700 transition flex items-center gap-1 group"
                        title={record.book.title}
                      >
                        <span className="truncate">{record.book.title}</span>
                        <ArrowUpRight size={13} className="shrink-0 text-gray-400 group-hover:text-amber-700 transition" />
                      </Link>

                      {/* Status Badge */}
                      {record.status === "PENDING" && (
                        <span className="shrink-0 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          Chờ duyệt
                        </span>
                      )}
                      {record.status === "BORROWING" && (
                        <span className="shrink-0 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          Đang mượn
                        </span>
                      )}
                      {record.status === "RETURNED" && (
                        <span className="shrink-0 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Đã trả
                        </span>
                      )}
                      {record.status === "REJECTED" && (
                        <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                          Bị từ chối
                        </span>
                      )}
                      {record.status === "CANCELLED" && (
                        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                          Đã hủy
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Tác giả: <span className="text-gray-800 font-medium">{record.book.author || "—"}</span>
                    </p>

                    {/* Timeline dates */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        <span>Mượn: {new Date(record.borrowedAt || record.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock size={13} className="text-gray-400 shrink-0" />
                        <span>Hạn trả: <strong>{new Date(record.dueDate).toLocaleDateString("vi-VN")}</strong></span>
                      </div>

                      {record.returnedAt && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span>Đã trả: {new Date(record.returnedAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Warning Badge */}
                    {dueInfo && (
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${dueInfo.color}`}
                      >
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{dueInfo.label}</span>
                      </div>
                    )}

                    {/* Lý do từ chối nếu có */}
                    {record.rejectReason && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-100 leading-relaxed">
                        Lý do từ chối: {record.rejectReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chân Thẻ: Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="text-xs text-gray-400 font-mono">
                    #{record.id}
                    {record.renewCount > 0 && (
                      <span className="ml-2 font-medium text-blue-600">
                        • Đã gia hạn ({record.renewCount}/1)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hủy yêu cầu khi PENDING */}
                    {record.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(record)}
                        disabled={cancelMutation.isPending}
                        className="cursor-pointer rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        Hủy yêu cầu
                      </button>
                    )}

                    {/* Gia hạn khi BORROWING */}
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
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw size={13} className={renewMutation.isPending ? "animate-spin" : ""} />
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3.5 rounded-2xl border border-gray-200/80 shadow-2xs sm:flex-row">
          <p className="text-xs text-gray-500">
            Trang <span className="font-semibold text-gray-900">{pagination?.page}</span> /{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span> (Tổng cộng{" "}
            <span className="font-semibold text-gray-900">{pagination?.total}</span> bản ghi)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
