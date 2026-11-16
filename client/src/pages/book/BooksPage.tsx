import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Search,
  Wallet,
  X,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Edit,
  Trash,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

import {
  useBooks,
  useBookAuthors,
  useCreateBook,
  useUpdateBook,
  useUploadBookCover,
  useDeleteBook,
} from "@/hooks/use-books";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import type { Book, CreateBookPayload } from "@/api/book.api";
import { BookForm } from "@/components/books/BookForm";
import { useCategories } from "@/hooks/use-categories";
import { RequestBorrowModal } from "@/components/borrow/RequestBorrowModal";
import { getMediaUrl } from "@/lib/media";

const DEFAULT_LIMIT = 12;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function BooksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const isMember = user?.role === "MEMBER";

  // URL Query Parameters
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const searchParam = searchParams.get("search") || "";
  const authorParam = searchParams.get("author") || "";
  const categoryIdParam = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : undefined;

  // Local Search Input with Debounce
  const [searchInput, setSearchInput] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);

  if (prevSearchParam !== searchParam) {
    setPrevSearchParam(searchParam);
    setSearchInput(searchParam);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== searchParam) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) {
            next.set("search", trimmed);
          } else {
            next.delete("search");
          }
          next.delete("page");
          return next;
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, searchParam, setSearchParams]);

  // View Mode: Member defaults to Grid, Managers default to Table
  const [viewMode, setViewMode] = useState<"grid" | "table">(() =>
    isMember ? "grid" : "table",
  );

  // Local availability filter (Còn sách / Đang mượn hết)
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "AVAILABLE" | "OUT_OF_STOCK"
  >("ALL");

  // Navigation & Filter Handlers
  const setPage = useCallback(
    (updater: number | ((current: number) => number)) => {
      setSearchParams((prev) => {
        const currentPageParam = Number(prev.get("page"));
        const currentPage =
          Number.isInteger(currentPageParam) && currentPageParam > 0
            ? currentPageParam
            : 1;
        const newPage =
          typeof updater === "function" ? updater(currentPage) : updater;

        const next = new URLSearchParams(prev);
        if (newPage <= 1) {
          next.delete("page");
        } else {
          next.set("page", String(newPage));
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const handleAuthorChange = (newAuthor: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newAuthor.trim()) {
        next.set("author", newAuthor.trim());
      } else {
        next.delete("author");
      }
      next.delete("page");
      return next;
    });
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newCategoryId) {
        next.set("categoryId", newCategoryId);
      } else {
        next.delete("categoryId");
      }
      next.delete("page");
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("page");
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("ALL");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("author");
      next.delete("categoryId");
      next.delete("page");
      return next;
    });
  };

  const hasActiveFilters = Boolean(
    searchParam ||
    authorParam ||
    categoryIdParam !== undefined ||
    statusFilter !== "ALL",
  );

  // Queries
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  const { data: authors = [] } = useBookAuthors();

  const { data, isLoading, isError, isFetching } = useBooks({
    page,
    limit: DEFAULT_LIMIT,
    search: searchParam || undefined,
    author: authorParam || undefined,
    categoryId: categoryIdParam,
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Filter books locally by status if selected
  const books = useMemo(() => {
    const list = data?.data ?? [];
    if (statusFilter === "ALL") return list;
    if (statusFilter === "AVAILABLE") {
      return list.filter(
        (book) => book.quantity - book.borrowedQuantity > 0,
      );
    }
    if (statusFilter === "OUT_OF_STOCK") {
      return list.filter(
        (book) => book.quantity - book.borrowedQuantity <= 0,
      );
    }
    return list;
  }, [data?.data, statusFilter]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (pagination && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [pagination, totalPages, page, setPage]);

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

  // Modals state
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<Book | null>(
    null,
  );
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedBook(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (book: Book) => {
    setFormMode("edit");
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const uploadCoverMutation = useUploadBookCover();
  const deleteMutation = useDeleteBook();

  const handleFormSubmit = async (
    formData: CreateBookPayload,
    coverFile?: File,
  ) => {
    if (formMode === "create") {
      const createdBook = await createMutation.mutateAsync(formData);

      if (coverFile) {
        await uploadCoverMutation.mutateAsync({
          id: createdBook.id,
          file: coverFile,
        });
      }
    } else if (selectedBook) {
      await updateMutation.mutateAsync({
        id: selectedBook.id,
        payload: formData,
      });

      if (coverFile) {
        await uploadCoverMutation.mutateAsync({
          id: selectedBook.id,
          file: coverFile,
        });
      }
    }

    setIsFormOpen(false);
    setSelectedBook(undefined);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ========================================================= */}
      {/* 1. Header & Actions Toolbar (Role-Adaptive) */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
              {isMember ? "Kho sách thư viện" : "Quản lý danh mục sách"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
              <Sparkles size={12} className="text-amber-600" />
              {isMember ? "Khám phá & Mượn sách" : "Hệ thống quản trị"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            {isMember
              ? "Khám phá hàng ngàn tựa sách phong phú, tra cứu thông tin và gửi yêu cầu mượn trực tuyến."
              : "Quản lý số lượng bản sách, theo dõi tình trạng lưu thông, đơn giá và chỉnh sửa thông tin sách."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 w-full sm:w-auto">
          {isMember ? (
            <button
              type="button"
              onClick={() => navigate("/my-borrows")}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <BookOpen size={16} />
              <span>Tủ sách của tôi</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/assets")}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
              >
                <Wallet size={16} className="text-amber-600" />
                <span className="hidden sm:inline">Báo cáo tài sản</span>
                <span className="sm:hidden">Tài sản</span>
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={isCategoriesLoading || isCategoriesError}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-amber-400 shadow-xs hover:bg-gray-800 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Thêm sách mới</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Search & Advanced Filter Toolbar */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tựa sách hoặc mã ISBN..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryIdParam ?? ""}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Author Filter */}
            <select
              value={authorParam}
              onChange={(e) => handleAuthorChange(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="">Tất cả tác giả</option>
              {authors.map((authorName) => (
                <option key={authorName} value={authorName}>
                  {authorName}
                </option>
              ))}
            </select>

            {/* Availability Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "AVAILABLE" | "OUT_OF_STOCK",
                )
              }
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">Tất cả tình trạng</option>
              <option value="AVAILABLE">Còn sách sẵn sàng</option>
              <option value="OUT_OF_STOCK">Đang mượn hết</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
                title="Chế độ xem lưới thẻ sách"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${viewMode === "table"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
                title="Chế độ xem bảng chi tiết"
              >
                <TableIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary & Reset Pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Tìm thấy{" "}
              <strong className="text-gray-900 font-semibold">
                {books.length}
              </strong>{" "}
              {pagination ? `trên tổng số ${pagination.total}` : ""}{" "}
              cuốn sách phù hợp
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              <RotateCcw size={12} />
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. Loading Skeleton */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(DEFAULT_LIMIT)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Error State */}
      {/* ========================================================= */}
      {isError && (
        <div className="max-w-2xl mx-auto my-8 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-2xs">
            <BookOpen size={28} />
          </div>
          <h2 className="text-lg font-bold text-rose-900">
            Không thể tải danh mục sách
          </h2>
          <p className="mt-2 text-sm text-rose-700 max-w-md">
            Đã có sự cố khi kết nối tới máy chủ. Vui lòng kiểm tra lại mạng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => navigate(0)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700 cursor-pointer"
          >
            <RotateCcw size={16} />
            Tải lại trang
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. Empty State */}
      {/* ========================================================= */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 sm:p-14 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-2xs">
            <Search size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900">
            {hasActiveFilters
              ? "Không tìm thấy cuốn sách nào phù hợp"
              : "Hiện chưa có cuốn sách nào"}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc."
              : "Thư viện hiện chưa có đầu sách nào trong danh mục."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 cursor-pointer"
            >
              <RotateCcw size={14} />
              Xóa bộ lọc & xem tất cả
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. Main Books Content */}
      {/* ========================================================= */}
      {!isLoading && !isError && books.length > 0 && (
        <>
          {/* ======================================================= */}
          {/* 6.1 Gallery Grid View (Ideal for Readers & Visual Inspection) */}
          {/* ======================================================= */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
              {books.map((book) => {
                const available = book.quantity - book.borrowedQuantity;
                const isAvailable = available > 0;
                const coverUrl = getMediaUrl(book.coverImage);

                return (
                  <div
                    key={book.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div>
                      {/* Book Cover Image Area */}
                      <div
                        onClick={() =>
                          navigate(`/books/${book.id}`, {
                            state: {
                              from: `${location.pathname}${location.search}`,
                            },
                          })
                        }
                        className="relative h-56 sm:h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-gray-100 flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        {/* Book Spine 3D Effect */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-10" />

                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-amber-700/60 p-4 text-center">
                            <BookOpen size={40} className="mb-2" />
                            <span className="text-xs font-semibold line-clamp-2">
                              {book.title}
                            </span>
                          </div>
                        )}

                        {/* Floating Status Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                              <CheckCircle2 size={11} />
                              Còn {available} bản
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/90 text-white backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                              <Clock size={11} />
                              Đang mượn hết
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Book Meta & Title */}
                      <div className="mt-3">
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {book.category.name}
                        </span>

                        <h3
                          onClick={() =>
                            navigate(`/books/${book.id}`, {
                              state: {
                                from: `${location.pathname}${location.search}`,
                              },
                            })
                          }
                          className="mt-1.5 font-bold text-sm sm:text-base text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug cursor-pointer"
                          title={book.title}
                        >
                          {book.title}
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                          {book.author}
                        </p>

                        <p className="mt-1 font-mono text-[11px] text-gray-400">
                          ISBN: {book.isbn}
                        </p>

                        {/* Inventory & Price (Only for Managers) */}
                        {!isMember && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-900 tabular-nums">
                              {formatCurrency(Number(book.price))}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Tổng: <strong>{book.quantity}</strong> | Mượn:{" "}
                              <strong>{book.borrowedQuantity}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-3.5 pt-3 border-t border-gray-100">
                      {isMember ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBorrowBook(book);
                            setIsBorrowModalOpen(true);
                          }}
                          disabled={!isAvailable}
                          className={`w-full h-9 rounded-xl px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                            isAvailable
                              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <BookOpen size={14} />
                          <span>
                            {isAvailable ? "Mượn sách" : "Tạm hết sách"}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/books/${book.id}`, {
                                state: {
                                  from: `${location.pathname}${location.search}`,
                                },
                              })
                            }
                            className="flex-1 py-1.5 px-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center gap-1 text-xs font-semibold transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Chi tiết</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(book)}
                            className="flex-1 py-1.5 px-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100/70 flex items-center justify-center gap-1 text-xs font-semibold transition cursor-pointer"
                          >
                            <Edit size={13} />
                            <span>Sửa</span>
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              disabled={deleteMutation.isPending}
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  `Bạn có chắc chắn muốn xóa cuốn sách "${book.title}"?`,
                                );
                                if (!confirmed) return;
                                await deleteMutation.mutateAsync(book.id);
                                if (books.length === 1 && page > 1) {
                                  setPage((current) => current - 1);
                                }
                              }}
                              className="h-8 w-8 shrink-0 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                              title="Xóa sách"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================= */}
          {/* 6.2 Table View (Ideal for Managers & Detailed Auditing) */}
          {/* ======================================================= */}
          {viewMode === "table" && (
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-200/80 bg-gray-50/75 text-xs font-semibold text-gray-700">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 w-14 text-center">
                        STT
                      </th>
                      <th scope="col" className="px-5 py-3.5 min-w-[280px]">
                        Đầu sách
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-center whitespace-nowrap">
                        Tác giả
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-center whitespace-nowrap"
                      >
                        Thể loại
                      </th>

                      {/* Management Columns (Hidden for Members) */}
                      {!isMember && (
                        <>
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-center whitespace-nowrap"
                          >
                            Đơn giá
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-center whitespace-nowrap"
                          >
                            Tổng số bản
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-center whitespace-nowrap"
                          >
                            Đang mượn
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-center whitespace-nowrap"
                          >
                            Sẵn sàng
                          </th>
                        </>
                      )}

                      <th
                        scope="col"
                        className="px-5 py-3.5 text-center whitespace-nowrap"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {books.map((book, index) => {
                      const available = book.quantity - book.borrowedQuantity;
                      const isAvailable = available > 0;
                      const coverUrl = getMediaUrl(book.coverImage);

                      return (
                        <tr
                          key={book.id}
                          className="transition-colors hover:bg-amber-50/25"
                        >
                          {/* Index */}
                          <td className="px-5 py-3.5 text-center text-xs text-gray-400 tabular-nums">
                            {(page - 1) * DEFAULT_LIMIT + index + 1}
                          </td>

                          {/* Cover & Title */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() =>
                                  navigate(`/books/${book.id}`, {
                                    state: {
                                      from: `${location.pathname}${location.search}`,
                                    },
                                  })
                                }
                                className="h-12 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                              >
                                {coverUrl ? (
                                  <img
                                    src={coverUrl}
                                    alt={book.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <BookOpen size={16} className="text-amber-700/60" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/books/${book.id}`}
                                  state={{
                                    from: `${location.pathname}${location.search}`,
                                  }}
                                  className="font-bold text-gray-900 hover:text-amber-800 transition-colors line-clamp-1 leading-snug"
                                  title={book.title}
                                >
                                  {book.title}
                                </Link>
                                <span className="font-mono text-xs text-gray-400 block mt-0.5">
                                  {book.isbn}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="px-4 py-3.5 font-medium text-gray-700 text-center whitespace-nowrap">
                            {book.author}
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {book.category.name}
                            </span>
                          </td>

                          {/* Manager Stats */}
                          {!isMember && (
                            <>
                              <td className="px-4 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                                {formatCurrency(Number(book.price))}
                              </td>
                              <td className="px-4 py-3.5 text-center font-bold text-gray-800 whitespace-nowrap tabular-nums">
                                {book.quantity}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap tabular-nums text-amber-700 font-semibold">
                                {book.borrowedQuantity}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap tabular-nums">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isAvailable
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                    }`}
                                >
                                  {available}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Actions Column */}
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            {isMember ? (
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/books/${book.id}`}
                                  state={{
                                    from: `${location.pathname}${location.search}`,
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-2xs cursor-pointer"
                                  title="Xem chi tiết"
                                >
                                  <Eye size={13} />
                                  <span>Chi tiết</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBorrowBook(book);
                                    setIsBorrowModalOpen(true);
                                  }}
                                  disabled={!isAvailable}
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] ${
                                    isAvailable
                                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  <BookOpen size={13} />
                                  <span>
                                    {isAvailable ? "Mượn sách" : "Hết sách"}
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/books/${book.id}`, {
                                      state: {
                                        from: `${location.pathname}${location.search}`,
                                      },
                                    })
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                                  title="Xem chi tiết"
                                >
                                  <Eye size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEdit(book)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                                  title="Chỉnh sửa thông tin sách"
                                >
                                  <Edit size={14} />
                                </button>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={async () => {
                                      const confirmed = window.confirm(
                                        `Bạn có chắc chắn muốn xóa cuốn sách "${book.title}"?`,
                                      );
                                      if (!confirmed) return;
                                      await deleteMutation.mutateAsync(book.id);
                                      if (books.length === 1 && page > 1) {
                                        setPage((current) => current - 1);
                                      }
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                                    title="Xóa sách"
                                  >
                                    <Trash size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* 7. Pagination Footer */}
          {/* ======================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 shadow-2xs">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              {pagination ? (
                <>
                  Trang{" "}
                  <strong className="text-gray-900 font-semibold">
                    {pagination.page}
                  </strong>{" "}
                  / {pagination.totalPages} (Tổng cộng{" "}
                  <strong className="text-gray-900 font-semibold">
                    {pagination.total}
                  </strong>{" "}
                  cuốn sách)
                </>
              ) : (
                "Đang tải số trang..."
              )}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={page === 1 || isFetching}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={14} /> Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => {
                      const isActive = pageNumber === page;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={isFetching}
                          className={`h-8 min-w-8 rounded-xl px-2 text-xs font-bold tabular-nums transition cursor-pointer ${isActive
                            ? "bg-gray-900 text-white shadow-xs"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={page >= totalPages || isFetching}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 8. Modals (BookForm & RequestBorrowModal) */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold font-heading text-gray-900">
                {formMode === "create"
                  ? "Thêm sách mới vào thư viện"
                  : "Cập nhật thông tin sách"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {formMode === "create"
                  ? "Điền thông tin chi tiết để thêm đầu sách mới vào hệ thống quản lý."
                  : "Chỉnh sửa các trường thông tin cần cập nhật của cuốn sách."}
              </p>
            </div>

            <BookForm
              mode={formMode}
              book={selectedBook}
              categories={categories}
              isSubmitting={
                createMutation.isPending ||
                updateMutation.isPending ||
                uploadCoverMutation.isPending
              }
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedBook(undefined);
              }}
            />
          </div>
        </div>
      )}

      <RequestBorrowModal
        isOpen={isBorrowModalOpen}
        book={selectedBorrowBook}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedBorrowBook(null);
        }}
      />
    </div>
  );
}
