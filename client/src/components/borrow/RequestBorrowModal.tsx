import { useState } from "react";
import { BookOpen, CheckCircle2, Clock, Info, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRequestBorrow } from "@/hooks/use-borrow";
import { getMediaUrl } from "@/lib/media";

interface BookData {
  id: number;
  title: string;
  isbn: string;
  author: string;
  quantity: number;
  borrowedQuantity: number;
  coverImage?: string | null;
  category?: {
    id?: number;
    name: string;
  };
}

interface RequestBorrowModalProps {
  isOpen: boolean;
  book: BookData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestBorrowModal({
  isOpen,
  book,
  onClose,
  onSuccess,
}: RequestBorrowModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const user = useAuthStore((state) => state.user);
  const requestBorrowMutation = useRequestBorrow();

  if (!isOpen || !book) {
    return null;
  }

  const availableQuantity = book.quantity - book.borrowedQuantity;

  const handleClose = () => {
    setNotes("");
    setError("");
    setIsDone(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (availableQuantity <= 0) {
      setError("Rất tiếc, cuốn sách này hiện đã hết bản sao khả dụng.");
      return;
    }

    try {
      await requestBorrowMutation.mutateAsync({
        bookId: book.id,
        notes: notes.trim() || undefined,
      });

      setIsDone(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Gửi yêu cầu thất bại. Vui lòng thử lại sau.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header with gold accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8A5A1E] via-[#B8863B] to-[#D4A853]" />

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-[#8A5A1E]">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Yêu cầu mượn sách
              </h3>
              <p className="text-xs text-gray-500">
                Gửi yêu cầu để thủ thư chuẩn bị sách cho bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 font-serif">
              Đã gửi yêu cầu mượn thành công!
            </h4>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Yêu cầu của bạn đã được chuyển đến thủ thư. Vui lòng theo dõi trạng thái tại mục{" "}
              <span className="font-semibold text-[#8A5A1E]">"Tủ sách của tôi"</span> và đến quầy thư viện nhận sách khi được duyệt.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg bg-[#8A5A1E] py-2.5 px-4 font-medium text-white transition hover:bg-[#724814]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <Info size={18} className="shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Book Info Summary */}
            <div className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="h-24 w-18 shrink-0 overflow-hidden rounded-md bg-gray-200 border border-gray-200">
                {book.coverImage ? (
                  <img
                    src={getMediaUrl(book.coverImage)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <BookOpen size={24} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold text-gray-900" title={book.title}>
                  {book.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Tác giả: {book.author}</p>
                {book.category && (
                  <span className="mt-1.5 inline-block rounded bg-amber-100/60 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    {book.category.name}
                  </span>
                )}

                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="text-gray-500">ISBN: {book.isbn}</span>
                  <span
                    className={`font-medium ${
                      availableQuantity > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    • Còn {availableQuantity} cuốn khả dụng
                  </span>
                </div>
              </div>
            </div>

            {/* Borrower & Policy Info */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <div>
                <span className="text-gray-500">Người mượn:</span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {user?.fullName || user?.username}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Mã độc giả:</span>
                <p className="font-mono font-semibold text-[#8A5A1E] mt-0.5">
                  {user?.memberCode || `MB-${user?.id}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 pt-2 border-t border-gray-100 text-gray-600">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <span>Thời hạn mượn: <strong>14 ngày</strong> (hỗ trợ gia hạn thêm 1 lần khi chưa quá hạn)</span>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Ghi chú cho thủ thư (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Xin nhận sách vào buổi chiều sau 14h..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={requestBorrowMutation.isPending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={requestBorrowMutation.isPending || availableQuantity <= 0}
                className="rounded-lg bg-gradient-to-r from-[#3b2410] to-[#7a4b1e] px-5 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requestBorrowMutation.isPending
                  ? "Đang gửi yêu cầu..."
                  : "Xác nhận gửi yêu cầu"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
