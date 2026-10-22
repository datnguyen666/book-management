import { useEffect, useMemo, useState } from "react";
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

  const { data: booksData, isLoading: isBooksLoading } = useBooks({
    page: 1,
    limit: 100,
  });

  const { data: membersData, isLoading: isMembersLoading } = useMembers({
    page: 1,
    limit: 8,
    search: memberSearch.trim() || undefined,
  });

  const books = booksData?.data ?? [];
  const members = membersData?.data ?? [];

  const availableBooks = useMemo(() => {
    return books.filter((book) => book.quantity - book.borrowedQuantity > 0);
  }, [books]);

  useEffect(() => {
    if (isOpen) {
      setMemberSearch("");
      setSelectedMember(null);
      setBookId("");
      setDueDate(getDefaultDueDate());
      setError("");
    }
  }, [isOpen]);

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
        "Bạn đọc có sách đã quá hạn chưa hoàn trả. Vui lòng hoàn trả sách trước khi mượn cuốn mới.",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Tạo phiếu mượn sách tại quầy
              </h2>
              <p className="text-xs text-gray-500">
                Liên kết trực tiếp với tài khoản bạn đọc và kiểm tra điều kiện mượn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Thông báo lỗi */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Chọn bạn đọc */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Bạn đọc mượn sách</span>
              {selectedMember && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberSearch("");
                  }}
                  className="text-xs font-normal text-amber-700 hover:underline"
                >
                  Đổi bạn đọc khác
                </button>
              )}
            </label>

            {!selectedMember ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Tìm theo họ tên, mã thẻ (MB-xxxxx), email, SĐT..."
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                {/* Danh sách kết quả gợi ý */}
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-1 divide-y divide-gray-100">
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
                        className="flex w-full items-center justify-between rounded-md p-2 text-left transition hover:bg-white hover:shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold">
                            {m.fullName?.charAt(0) || m.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-800">
                                {m.fullName || m.username}
                              </span>
                              <span className="rounded bg-gray-100 px-1.5 py-0.2 text-[10px] font-mono text-gray-600">
                                {m.memberCode || `MB-${String(m.id).padStart(5, "0")}`}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {m.email} {m.phone ? `• ${m.phone}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          {!m.isActive ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              <UserX className="h-3 w-3" /> Đã khóa
                            </span>
                          ) : m.overdueCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              <AlertTriangle className="h-3 w-3" /> {m.overdueCount} quá hạn
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Đang mượn: <strong className="text-gray-700">{m.borrowingCount}</strong>/5
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
                className={`rounded-lg border p-3 transition ${
                  isMemberBlocked
                    ? "border-red-200 bg-red-50/50"
                    : "border-emerald-200 bg-emerald-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                        isMemberBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {selectedMember.fullName?.charAt(0) ||
                        selectedMember.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedMember.fullName || selectedMember.username}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-xs font-mono font-medium text-gray-700 shadow-xs border border-gray-200">
                          {selectedMember.memberCode ||
                            `MB-${String(selectedMember.id).padStart(5, "0")}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedMember.email} {selectedMember.phone ? `• ${selectedMember.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-600">
                      Sách đang mượn:{" "}
                      <strong className="text-gray-900">
                        {selectedMember.borrowingCount}/5
                      </strong>
                    </div>
                    {selectedMember.overdueCount > 0 && (
                      <div className="text-xs font-medium text-red-600">
                        {selectedMember.overdueCount} cuốn quá hạn
                      </div>
                    )}
                  </div>
                </div>

                {/* Cảnh báo nếu vi phạm */}
                {isMemberBlocked && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-md bg-white/80 p-2 text-xs text-red-700 border border-red-200">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
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
              Chọn sách cần mượn
            </label>

            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              disabled={isBooksLoading || isSubmitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
            >
              <option value="">
                {isBooksLoading ? "Đang tải danh mục sách..." : "-- Chọn một cuốn sách --"}
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
              <p className="mt-1 text-xs text-red-500">
                Hiện tại không còn cuốn sách nào khả dụng trong kho để mượn.
              </p>
            )}
          </div>

          {/* 3. Ngày hẹn trả */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Ngày hẹn hoàn trả
              </label>
              <span className="text-[11px] text-gray-500">
                (Gợi ý mặc định 14 ngày)
              </span>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dueDate}
                min={getMinDueDate()}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Xác nhận mượn sách"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
