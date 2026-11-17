import { useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Copy,
  Check,
  ChevronRight,
  Bookmark,
  FileText,
  Info,
  X,
  AlertCircle,
} from "lucide-react";

import { useBook, useUpdateBook, useUploadBookCover } from "@/hooks/use-books";
import { useCategories } from "@/hooks/use-categories";
import { usePageTitle } from "@/hooks/use-page-title";
import { getMediaUrl } from "@/lib/media";
import { RequestBorrowModal } from "@/components/borrow/RequestBorrowModal";
import { BookForm } from "@/components/books/BookForm";
import { useAuthStore } from "@/store/auth.store";
import type { CreateBookPayload } from "@/api/book.api";

export function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedIsbn, setCopiedIsbn] = useState(false);

  const fromUrl = (location.state as { from?: string } | null)?.from;
  const bookId = Number(id);

  const { data: book, isLoading, isError } = useBook(bookId);
  const { data: categories = [] } = useCategories();

  const updateMutation = useUpdateBook();
  const uploadCoverMutation = useUploadBookCover();

  const user = useAuthStore((state) => state.user);
  const isMember = user?.role === "MEMBER";

  // Cập nhật tiêu đề trang
  usePageTitle(book ? `${book.title} | Thư viện` : "Chi tiết đầu sách");

  const handleBack = () => {
    if (fromUrl) {
      navigate(fromUrl);
    } else if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/books");
    }
  };

  const handleCopyIsbn = () => {
    if (!book?.isbn) return;
    navigator.clipboard.writeText(book.isbn);
    setCopiedIsbn(true);
    setTimeout(() => setCopiedIsbn(false), 2000);
  };

  const handleFormSubmit = async (
    formData: CreateBookPayload,
    coverFile?: File
  ) => {
    if (!book) return;

    try {
      await updateMutation.mutateAsync({
        id: book.id,
        payload: formData,
      });

      if (coverFile) {
        await uploadCoverMutation.mutateAsync({
          id: book.id,
          file: coverFile,
        });
      }

      setIsEditOpen(false);
    } catch {
      // Lỗi được xử lý trong mutation
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Trường hợp ID sách không hợp lệ
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
        >
          <ArrowLeft size={15} />
          <span>Quay lại danh mục sách</span>
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-2xs">
          <AlertCircle size={22} className="shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">Mã đầu sách không hợp lệ</p>
            <p className="text-xs text-red-600 mt-0.5">
              Đường dẫn không đúng định dạng. Vui lòng quay lại danh sách để chọn đầu sách.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp đang tải dữ liệu (Skeleton Loading 2 cột responsive)
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-6 w-56 rounded-lg bg-gray-100 animate-pulse" />

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr]">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="mx-auto aspect-[3/4] w-full max-w-[240px] sm:max-w-none rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-gray-50 animate-pulse" />
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="space-y-3 pb-6 border-b border-gray-100">
              <div className="h-5 w-32 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-8 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-4 w-48 rounded-lg bg-gray-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse" />
              ))}
            </div>
            <div className="h-32 w-full rounded-xl bg-gray-50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp xảy ra lỗi hoặc không tìm thấy sách
  if (isError || !book) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
        >
          <ArrowLeft size={15} />
          <span>Quay lại danh mục sách</span>
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-2xs">
          <AlertCircle size={22} className="shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">Không tìm thấy thông tin đầu sách</p>
            <p className="text-xs text-red-600 mt-0.5">
              Đầu sách này có thể đã bị xóa hoặc xảy ra lỗi kết nối với máy chủ. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableQuantity = book.quantity - book.borrowedQuantity;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 1. Breadcrumbs & Điều Hướng */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto pb-1 sm:pb-0">
          <Link to="/" className="hover:text-gray-900 transition whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="shrink-0 text-gray-400" />
          <Link to="/books" className="hover:text-gray-900 transition whitespace-nowrap">
            Danh mục sách
          </Link>
          <ChevronRight size={13} className="shrink-0 text-gray-400" />
          <span className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[320px]">
            {book.title}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft size={14} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 2. Bố Cục Chính 2 Cột Responsive */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr]">
        {/* ========================================================= */}
        {/* CỘT TRÁI: Bìa Sách & Thao Tác Nhanh */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Khung ảnh bìa */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] sm:max-w-none overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
              {book.coverImage ? (
                <img
                  src={getMediaUrl(book.coverImage)}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-gray-400">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <BookOpen size={32} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Chưa có ảnh bìa</span>
                </div>
              )}

              {/* Badge trạng thái nổi trên ảnh */}
              <div className="absolute top-2.5 right-2.5">
                {availableQuantity > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Sẵn sàng phục vụ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/95 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                    Tạm hết sách
                  </span>
                )}
              </div>
            </div>

            {/* Cụm Nút Thao Tác Nhanh */}
            <div className="space-y-2 pt-1">
              {isMember ? (
                <button
                  type="button"
                  onClick={() => setIsBorrowOpen(true)}
                  disabled={availableQuantity <= 0}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                >
                  <BookOpen size={17} />
                  <span>{availableQuantity > 0 ? "Mượn sách ngay" : "Tạm hết sách"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black"
                >
                  <Pencil size={16} />
                  <span>Chỉnh sửa đầu sách</span>
                </button>
              )}
            </div>

            {/* Thẻ Tóm Tắt Tình Trạng Tồn Bản (Inventory Distribution) */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Tình trạng tài liệu</span>
                <span className="text-gray-500 font-mono">Tổng: {book.quantity} bản</span>
              </div>

              {/* Thanh phân bổ trực quan */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${book.quantity > 0 ? (availableQuantity / book.quantity) * 100 : 0}%`,
                  }}
                  title={`Khả dụng: ${availableQuantity} bản`}
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${book.quantity > 0 ? (book.borrowedQuantity / book.quantity) * 100 : 0}%`,
                  }}
                  title={`Đang mượn: ${book.borrowedQuantity} bản`}
                />
              </div>

              {/* Chú giải số liệu */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-500">Khả dụng:</span>
                  <span className="font-bold text-emerald-700">{availableQuantity}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-gray-500">Đang mượn:</span>
                  <span className="font-bold text-amber-700">{book.borrowedQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT PHẢI: Thông Tin Chi Tiết & Nội Dung */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-7 shadow-2xs space-y-6">
          {/* Header Thông Tin Sách */}
          <div className="space-y-3 pb-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {book.category ? (
                <Link
                  to={`/books?categoryId=${book.category.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200/60 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                  title={`Xem các đầu sách thuộc thể loại ${book.category.name}`}
                >
                  <Bookmark size={13} className="text-purple-600" />
                  <span>{book.category.name}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                  Chưa phân loại
                </span>
              )}

              <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                Mã đầu sách: #{book.id}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 font-heading">
              {book.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Tác giả:</span>
                <span className="font-semibold text-gray-900">{book.author}</span>
              </div>
              {book.publisher && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400">NXB:</span>
                  <span className="text-gray-700">{book.publisher}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lưới Thông Số Chi Tiết Thư Viện */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Thông số ấn phẩm & xuất bản
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* ISBN */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Mã ISBN</span>
                  <button
                    type="button"
                    onClick={handleCopyIsbn}
                    className="cursor-pointer text-gray-400 hover:text-gray-700 transition p-1"
                    title="Sao chép ISBN"
                  >
                    {copiedIsbn ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-gray-900">
                  {book.isbn}
                </div>
              </div>

              {/* Ngày phát hành */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <span className="text-xs text-gray-400">Ngày xuất bản</span>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(book.publishedDate)}
                </div>
              </div>

              {/* Giá bìa */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <span className="text-xs text-gray-400">Đơn giá niêm yết</span>
                <div className="mt-1 text-sm font-bold text-amber-700">
                  {formatCurrency(book.price)}
                </div>
              </div>

              {/* Nhà xuất bản */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <span className="text-xs text-gray-400">Nhà xuất bản</span>
                <div className="mt-1 text-sm font-medium text-gray-900 truncate">
                  {book.publisher || "Chưa cập nhật"}
                </div>
              </div>

              {/* Thời điểm nhập kho */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <span className="text-xs text-gray-400">Ngày nhập hệ thống</span>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {formatDate(book.createdAt)}
                </div>
              </div>

              {/* Tình trạng phục vụ */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 flex flex-col justify-between">
                <span className="text-xs text-gray-400">Trạng thái mượn</span>
                <div className="mt-1 text-sm font-medium">
                  {availableQuantity > 0 ? (
                    <span className="text-emerald-600 font-semibold">Đang phục vụ mượn</span>
                  ) : (
                    <span className="text-rose-600 font-semibold">Tạm ngưng mượn</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Khối Giới Thiệu & Trích Yếu Tác Phẩm */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <FileText size={17} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">
                Giới thiệu & Trích yếu tác phẩm
              </h3>
            </div>

            <div className="rounded-xl bg-gray-50/60 p-4 sm:p-5 border border-gray-100">
              {book.description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {book.description}
                </p>
              ) : (
                <p className="text-xs italic text-gray-400">
                  Chưa có thông tin giới thiệu chi tiết cho đầu sách này.
                </p>
              )}
            </div>
          </div>

          {/* Khối Quy Định Mượn Trả Tiêu Chuẩn */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <Info size={16} className="text-amber-700 shrink-0" />
              <span>Quy định mượn sách & gia hạn tại thư viện</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-800/90 leading-relaxed pl-1">
              <li>
                Thời hạn mượn tiêu chuẩn: <strong>14 ngày</strong> kể từ khi duyệt phiếu mượn.
              </li>
              <li>
                Gia hạn: Được phép gia hạn tối đa <strong>2 lần</strong> nếu đầu sách không có bạn đọc khác đang đặt trước.
              </li>
              <li>
                Vui lòng giữ gìn tài liệu cẩn thận, không gập mép hay viết vẽ vào sách.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Yêu Cầu Mượn Sách (Phía Bạn Đọc) */}
      <RequestBorrowModal
        isOpen={isBorrowOpen}
        book={book}
        onClose={() => setIsBorrowOpen(false)}
      />

      {/* Modal Chỉnh Sửa Đầu Sách (Phía Quản Lý: Staff / Admin) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-heading text-gray-900">
                  Cập nhật thông tin đầu sách
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Chỉnh sửa các trường thông tin chi tiết và số lượng bản lưu trữ của cuốn sách.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="cursor-pointer rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <BookForm
              mode="edit"
              book={book}
              categories={categories}
              isSubmitting={updateMutation.isPending || uploadCoverMutation.isPending}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
