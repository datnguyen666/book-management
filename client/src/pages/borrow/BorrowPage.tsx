import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ChevronDown,
  Search,
  Plus,
  Check,
  X,
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

  const { data, isLoading, isError, isFetching } = useBorrows({
    page,
    limit: DEFAULT_LIMIT,
    search,
    status,
  });

  const borrows = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleCreateBorrow = async (data: CreateBorrowRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      setPage(1);
      window.alert("Tạo phiếu mượn sách thành công.");
    } catch (error: any) {
      console.error("Failed to create borrow record:", error);
      window.alert(error.response?.data?.message || "Tạo phiếu mượn thất bại.");
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
      `Phê duyệt yêu cầu mượn cuốn "${borrow.book.title}" cho bạn đọc "${memberName}"${memberCode} và xác nhận bàn giao sách?`,
    );

    if (!confirmed) return;

    try {
      await approveMutation.mutateAsync(borrow.id);
      window.alert("Đã duyệt yêu cầu và bàn giao sách thành công.");
    } catch (error: any) {
      console.error("Failed to approve borrow:", error);
      window.alert(
        error.response?.data?.message || "Không thể duyệt yêu cầu mượn sách.",
      );
    }
  };

  const handleReject = async (borrow: BorrowRecord) => {
    const memberName =
      borrow.member?.fullName || borrow.member?.username || "Bạn đọc";
    const reason = window.prompt(
      `Nhập lý do từ chối yêu cầu mượn "${borrow.book.title}" của bạn đọc "${memberName}":`,
      "Sách hiện không thể bàn giao",
    );

    if (reason === null) return;

    try {
      await rejectMutation.mutateAsync({
        id: borrow.id,
        reason: reason.trim() || undefined,
      });
      window.alert("Đã từ chối yêu cầu mượn sách.");
    } catch (error: any) {
      console.error("Failed to reject borrow:", error);
      window.alert(
        error.response?.data?.message || "Không thể từ chối yêu cầu.",
      );
    }
  };

  const handleReturn = async (borrow: BorrowRecord) => {
    const memberName =
      borrow.member?.fullName || borrow.member?.username || "Bạn đọc";
    const confirmed = window.confirm(
      `Xác nhận bạn đọc "${memberName}" đã hoàn trả cuốn sách "${borrow.book.title}"?`,
    );

    if (!confirmed) return;

    try {
      await returnMutation.mutateAsync(borrow.id);
      window.alert("Hoàn trả sách thành công.");
    } catch (error: any) {
      console.error("Failed to return book:", error);
      window.alert(
        error.response?.data?.message || "Không thể ghi nhận trả sách.",
      );
    }
  };

  const handlePrevious = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNext = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Quản Lý Mượn Trả
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Theo dõi, phê duyệt yêu cầu trực tuyến và quản lý hồ sơ mượn sách của thư viện
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-md bg-[#12192B] px-4 py-2.5 text-sm font-semibold text-[#C89B3C] transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Plus size={16} className="shrink-0" />
          <span className="whitespace-nowrap">Tạo phiếu mượn tại quầy</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên người mượn, mã độc giả, tên sách hoặc ISBN..."
            className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BorrowStatus | "");
              setPage(1);
            }}
            className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600 sm:w-52"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
            <option value="BORROWING">Đang mượn (Borrowing)</option>
            <option value="RETURNED">Đã trả (Returned)</option>
            <option value="REJECTED">Bị từ chối (Rejected)</option>
            <option value="CANCELLED">Đã hủy (Cancelled)</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Đang tải danh sách mượn sách...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Không thể tải dữ liệu mượn sách. Vui lòng thử lại sau.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && borrows.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-gray-400" size={40} />
          <p className="mt-3 text-sm font-medium text-gray-700">
            Không tìm thấy bản ghi nào
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {search || status
              ? "Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái."
              : "Hiện tại chưa có phiếu mượn nào trong hệ thống."}
          </p>
        </div>
      )}

      {/* Borrow Table */}
      {!isLoading && !isError && borrows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 w-16">
                    #ID
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Sách
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Bạn đọc
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Ngày mượn
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Hạn trả
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Ngày trả
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    Người xử lý
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {borrows.map((borrow) => {
                  const overdue = isOverdue(borrow.dueDate, borrow.status);

                  return (
                    <tr
                      key={borrow.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">
                        #{borrow.id}
                      </td>

                      {/* Book */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 whitespace-nowrap" title={borrow.book.title}>
                          {borrow.book.title}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400 whitespace-nowrap">
                          ISBN: {borrow.book.isbn}
                        </div>
                      </td>

                      {/* Member / Bạn đọc */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {borrow.member?.fullName || borrow.member?.username || "Chưa xác định"}
                        </div>
                        <div className="mt-0.5 text-xs font-mono text-amber-700 whitespace-nowrap">
                          {borrow.member?.memberCode || `MB-${String(borrow.memberId).padStart(5, '0')}`}
                          {borrow.member?.email && (
                            <span className="ml-1.5 text-gray-400 font-sans whitespace-nowrap">
                              ({borrow.member.email})
                            </span>
                          )}
                        </div>
                        {borrow.notes && (
                          <div className="mt-1 text-[11px] text-gray-500 italic max-w-xs truncate" title={borrow.notes}>
                            Ghi chú: {borrow.notes}
                          </div>
                        )}
                      </td>

                      {/* Borrowed At */}
                      <td className="px-6 py-4 text-center whitespace-nowrap text-gray-700 text-xs">
                        {new Date(borrow.borrowedAt || borrow.createdAt).toLocaleDateString()}
                      </td>

                      {/* Due Date */}
                      <td
                        className={`px-6 py-4 text-center whitespace-nowrap text-xs ${overdue ? "font-semibold text-red-600" : "text-gray-700"
                          }`}
                      >
                        {new Date(borrow.dueDate).toLocaleDateString()}
                        {overdue && (
                          <div className="mt-0.5 text-[11px] font-bold text-red-500">
                            Quá hạn
                          </div>
                        )}
                      </td>

                      {/* Returned At */}
                      <td className="px-6 py-4 text-center whitespace-nowrap text-gray-700 text-xs">
                        {borrow.returnedAt
                          ? new Date(borrow.returnedAt).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {borrow.status === "PENDING" && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Chờ duyệt
                          </span>
                        )}
                        {borrow.status === "BORROWING" && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Đang mượn
                          </span>
                        )}
                        {borrow.status === "RETURNED" && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Đã trả
                          </span>
                        )}
                        {borrow.status === "REJECTED" && (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            Bị từ chối
                          </span>
                        )}
                        {borrow.status === "CANCELLED" && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            Đã hủy
                          </span>
                        )}
                      </td>

                      {/* Processed By */}
                      <td className="px-6 py-4 whitespace-nowrap text text-xs">
                        {borrow.processedBy ? (
                          <div>
                            <div className="font-medium text-gray-700">
                              {borrow.processedBy.fullName || borrow.processedBy.username}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              @{borrow.processedBy.username}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa duyệt</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {borrow.status === "PENDING" && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(borrow)}
                              disabled={approveMutation.isPending}
                              title="Duyệt & Bàn giao sách"
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition"
                            >
                              <Check size={13} />
                              <span>Duyệt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(borrow)}
                              disabled={rejectMutation.isPending}
                              title="Từ chối yêu cầu"
                              className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
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
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition hover:text-emerald-800 disabled:opacity-40"
                          >
                            <RotateCcw
                              size={14}
                              className={returnMutation.isPending ? "animate-spin" : ""}
                            />
                            <span>Nhận trả sách</span>
                          </button>
                        )}

                        {borrow.status === "RETURNED" && (
                          <span className="text-xs text-gray-400">Đã hoàn tất</span>
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
          <div className="flex items-center justify-between border-t bg-white px-6 py-4">
            <p className="text-xs text-gray-500">
              {pagination
                ? `Hiển thị trang ${pagination.page} / ${pagination.totalPages} (${pagination.total} bản ghi)`
                : "Đang tải..."}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={page === 1 || isFetching}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => {
                  const isActive = pageNumber === page;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isFetching}
                      className={`min-w-8 rounded-md px-2 py-1.5 text-xs font-medium tabular-nums transition ${isActive
                        ? "bg-[#12192B] text-[#C89B3C]"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                },
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages || isFetching}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal create at desk */}
      <CreateBorrowModal
        isOpen={isCreateOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBorrow}
      />
    </div>
  );
}
