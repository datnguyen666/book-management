import { useMemo, useState, useRef } from "react";
import {
  X,
  Search,
  UserX,
  AlertTriangle,
  BookOpen,
  Calendar,
  RefreshCw,
} from "lucide-react";

import type { CreateBorrowRequest } from "@/api/borrow.api";
import type { MemberSummary } from "@/api/member.api";
import { useBooks } from "@/hooks/use-books";
import { useMembers } from "@/hooks/use-member";

interface CreateBorrowModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBorrowRequest) => Promise<void>;
}

function getDefaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function getMinDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function CreateBorrowModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateBorrowModalProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null,
  );
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [error, setError] = useState("");

  const dueDateInputRef = useRef<HTMLInputElement | null>(null);

  const { data: booksData, isLoading: isBooksLoading } = useBooks({
    page: 1,
    limit: 100,
  });

  const { data: membersData, isLoading: isMembersLoading } = useMembers({
    page: 1,
    limit: 8,
    search: memberSearch.trim() || undefined,
  });

  const members = membersData?.data ?? [];

  const availableBooks = useMemo(() => {
    return (booksData?.data ?? []).filter(
      (book) => book.quantity - book.borrowedQuantity > 0
    );
  }, [booksData?.data]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMemberSearch("");
      setSelectedMember(null);
      setBookId("");
      setDueDate(getDefaultDueDate());
      setError("");
    }
  }

  if (!isOpen) {
    return null;
  }

  // Ràng buộc kiểm tra bạn đọc
  const isMemberInactive = selectedMember && !selectedMember.isActive;
  const isMemberOverdue = selectedMember && selectedMember.overdueCount > 0;
  const isMemberLimitReached =
    selectedMember && selectedMember.borrowingCount >= 5;

  const isMemberBlocked =
    isMemberInactive || isMemberOverdue || isMemberLimitReached;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!selectedMember) {
      setError("Vui lòng tìm kiếm và chọn bạn đọc mượn sách.");
      return;
    }

    if (isMemberInactive) {
      setError("Tài khoản bạn đọc đang bị khóa, không thể tạo phiếu mượn.");
      return;
    }

    if (isMemberOverdue) {
      setError(
        "Bạn đọc có sách đã quá hạn chưa hoàn trả. Cần hoàn trả sách trước khi mượn cuốn mới.",
      );
      return;
    }

    if (isMemberLimitReached) {
      setError(
        "Bạn đọc đã đạt giới hạn tối đa 5 cuốn sách đang mượn hoặc chờ duyệt.",
      );
      return;
    }

    if (!bookId) {
      setError("Vui lòng chọn cuốn sách cần mượn.");
      return;
    }

    if (!dueDate) {
      setError("Vui lòng chọn ngày hẹn hoàn trả sách.");
      return;
    }

    const selectedDate = new Date(dueDate);
    if (selectedDate <= new Date()) {
      setError("Hạn trả sách phải sau ngày hôm nay.");
      return;
    }

    try {
      await onSubmit({
        memberId: selectedMember.id,
        bookId: Number(bookId),
        dueDate,
      });
    } catch {
      // Lỗi hiển thị đã được xử lý ở BorrowPage
    }
  };

  const getInitials = (name?: string | null, username = "BD") => {
    const target = name || username;
    const parts = target.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">
                Tạo phiếu mượn sách tại quầy
              </h2>
              <p className="text-xs text-gray-500">
                Liên kết trực tiếp với tài khoản bạn đọc và kiểm tra điều kiện lưu thông
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto p-5 sm:p-6"
        >
          {/* Thông báo lỗi */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 1. Chọn bạn đọc */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-xs font-semibold text-gray-700">
              <span>Bạn đọc mượn sách <span className="text-red-500">*</span></span>
              {selectedMember && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberSearch("");
                  }}
                  className="cursor-pointer text-xs font-medium text-amber-700 hover:underline"
                >
                  Đổi bạn đọc khác
                </button>
              )}
            </div>

            {!selectedMember ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Tìm theo họ tên, mã thẻ (MB-xxxxx), email, SĐT..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Danh sách kết quả gợi ý */}
                <div className="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-1">
                  {isMembersLoading ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      Đang tìm kiếm bạn đọc...
                    </div>
                  ) : members.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      Không tìm thấy bạn đọc nào phù hợp
                    </div>
                  ) : (
                    members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(m);
                          setError("");
                        }}
                        className="cursor-pointer flex w-full flex-col gap-2 rounded-lg p-2.5 text-left transition hover:bg-white hover:shadow-2xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                            {getInitials(m.fullName, m.username)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {m.fullName || m.username}
                              </span>
                              <span className="shrink-0 whitespace-nowrap rounded-md border border-amber-200/70 bg-amber-50 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-amber-800">
                                {m.memberCode ||
                                  `MB-${String(m.id).padStart(5, "0")}`}
                              </span>
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {m.email} {m.phone ? `• ${m.phone}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="pl-10 text-left text-xs sm:shrink-0 sm:pl-0 sm:text-right">
                          {!m.isActive ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-rose-600">
                              <UserX size={12} /> Đã khóa
                            </span>
                          ) : m.overdueCount > 0 ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-rose-600">
                              <AlertTriangle size={12} /> {m.overdueCount} quá hạn
                            </span>
                          ) : (
                            <span className="whitespace-nowrap text-gray-500">
                              Đang mượn:{" "}
                              <strong className="text-gray-900 font-mono">
                                {m.borrowingCount}
                              </strong>
                              /5
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Thẻ thông tin bạn đọc được chọn */
              <div
                className={`rounded-xl border p-3.5 transition ${
                  isMemberBlocked
                    ? "border-rose-200 bg-rose-50/40"
                    : "border-emerald-200 bg-emerald-50/30"
                }`}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isMemberBlocked
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {getInitials(selectedMember.fullName, selectedMember.username)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-gray-900">
                          {selectedMember.fullName || selectedMember.username}
                        </span>
                        <span className="shrink-0 whitespace-nowrap rounded-md border border-amber-200/70 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-amber-800 shadow-2xs">
                          {selectedMember.memberCode ||
                            `MB-${String(selectedMember.id).padStart(5, "0")}`}
                        </span>
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {selectedMember.email}{" "}
                        {selectedMember.phone ? `• ${selectedMember.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 sm:block sm:shrink-0 sm:border-0 sm:pt-0 sm:text-right">
                    <div className="whitespace-nowrap text-xs text-gray-600">
                      Đang mượn:{" "}
                      <strong className="text-gray-900 font-mono">
                        {selectedMember.borrowingCount}/5
                      </strong>
                    </div>
                    {selectedMember.overdueCount > 0 && (
                      <div className="whitespace-nowrap text-xs font-bold text-rose-600">
                        {selectedMember.overdueCount} cuốn quá hạn!
                      </div>
                    )}
                  </div>
                </div>

                {/* Cảnh báo nếu vi phạm */}
                {isMemberBlocked && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-rose-200 bg-white p-2.5 text-xs text-rose-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <span className="font-medium">
                      {isMemberInactive
                        ? "Tài khoản bạn đọc đang bị khóa. Không thể tạo phiếu mượn."
                        : isMemberOverdue
                        ? "Bạn đọc đang có sách quá hạn chưa hoàn trả. Cần hoàn trả sách trước khi mượn tiếp."
                        : "Bạn đọc đã đạt giới hạn tối đa 5 cuốn sách đang mượn hoặc chờ duyệt."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Chọn sách */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Chọn đầu sách cần mượn <span className="text-red-500">*</span>
            </label>

            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              disabled={isBooksLoading || isSubmitting}
              className="w-full truncate rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50"
            >
              <option value="">
                {isBooksLoading
                  ? "Đang tải danh mục sách..."
                  : "-- Chọn một cuốn sách sẵn sàng phục vụ --"}
              </option>

              {availableBooks.map((book) => {
                const available = book.quantity - book.borrowedQuantity;
                return (
                  <option key={book.id} value={book.id}>
                    {book.title} (Còn khả dụng: {available} cuốn)
                  </option>
                );
              })}
            </select>

            {!isBooksLoading && availableBooks.length === 0 && (
              <p className="mt-1 text-xs text-rose-600">
                Hiện tại không còn cuốn sách nào khả dụng trong kho để mượn.
              </p>
            )}
          </div>

          {/* 3. Ngày hẹn hoàn trả (Click mở lịch + gõ phím trực tiếp) */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-semibold text-gray-700">
                Ngày hẹn hoàn trả <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                (Gợi ý tiêu chuẩn: 14 ngày)
              </span>
            </div>

            <div className="relative">
              <input
                type="date"
                ref={dueDateInputRef}
                value={dueDate}
                min={getMinDueDate()}
                onChange={(e) => setDueDate(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch {
                    // Fallback
                  }
                }}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    dueDateInputRef.current?.showPicker?.();
                  } catch {
                    dueDateInputRef.current?.focus();
                  }
                }}
                disabled={isSubmitting}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition"
                title="Bấm để mở lịch chọn ngày"
              >
                <Calendar size={16} />
              </button>
            </div>
          </div>

          {/* 4. Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer w-full whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:opacity-40 sm:w-auto"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isBooksLoading ||
                availableBooks.length === 0 ||
                !selectedMember ||
                Boolean(isMemberBlocked)
              }
              className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-amber-400 shadow-2xs transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                "Xác nhận tạo phiếu & Bàn giao"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
