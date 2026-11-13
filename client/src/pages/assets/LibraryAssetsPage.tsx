import {
  ArrowLeft,
  BookOpen,
  Copy,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Search,
  X,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

import { useAssets } from "@/hooks/use-assets";
import { exportAssetsToExcel, exportAssetsToPdf } from "@/utils/asset-export";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function SummaryCard({
  icon: Icon,
  label,
  sublabel,
  value,
  iconClassName,
  accentColor,
  className = "",
}: {
  icon: typeof BookOpen;
  label: string;
  sublabel?: string;
  value: string;
  iconClassName: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm hover:border-gray-300 min-h-[118px] ${className}`}
      style={
        accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined
      }
    >
      {/* Top: Label & Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 leading-snug">
            {label}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-[11px] text-gray-400 font-normal">
              {sublabel}
            </p>
          )}
        </div>
        <div
          className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
      </div>

      {/* Bottom: 100% width value */}
      <div className="mt-3">
        <p className="text-lg sm:text-xl xl:text-lg 2xl:text-xl font-bold tracking-tight text-gray-900 tabular-nums break-words leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export function LibraryAssetsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAssets();

  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    if (!data?.data) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data.data;

    return data.data.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(query);
      const isbnMatch = book.isbn.toLowerCase().includes(query);
      const categoryMatch = book.category?.name?.toLowerCase().includes(query);
      return titleMatch || isbnMatch || categoryMatch;
    });
  }, [data, searchQuery]);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredBooks.length);

  const paginatedBooks = useMemo(() => {
    return filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBooks, startIndex]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white p-4"
            />
          ))}
        </div>

        {/* Skeleton content */}
        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-base font-semibold text-red-700">
          Không thể tải dữ liệu tài sản thư viện
        </p>
        <p className="mt-1 text-sm text-red-600">
          Vui lòng kiểm tra lại kết nối mạng hoặc thử tải lại trang.
        </p>
        <button
          type="button"
          onClick={() => navigate(0)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportAssetsToPdf(data);
    } else {
      exportAssetsToExcel(data);
    }

    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Library Assets
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tổng quan giá trị tài sản của thư viện
            </p>
          </div>

          {/* Export action */}
          <div className="relative flex w-full sm:w-auto shrink-0">
            {/* Backdrop to close dropdown on touch/click outside */}
            {isExportMenuOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsExportMenuOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Download button */}
            <button
              type="button"
              onClick={handleExport}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-l-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer ${exportFormat === "pdf" ? "bg-red-600" : "bg-green-600"
                }`}
            >
              <Download size={16} />
              <span>
                {exportFormat === "pdf" ? "Export PDF" : "Export Excel"}
              </span>
            </button>

            {/* Dropdown toggle button */}
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((current) => !current)}
              className={`flex items-center justify-center rounded-r-lg border-l border-white/30 px-3 text-white transition hover:opacity-90 cursor-pointer ${exportFormat === "pdf" ? "bg-red-600" : "bg-green-600"
                }`}
              aria-label="Select export format"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isExportMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setExportFormat("pdf");
                    setIsExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileText size={16} className="text-red-600 shrink-0" />
                  <span className="font-medium">PDF Document</span>
                  {exportFormat === "pdf" && (
                    <span className="ml-auto text-xs font-semibold text-red-600">
                      Selected
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportFormat("excel");
                    setIsExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet
                    size={16}
                    className="text-green-600 shrink-0"
                  />
                  <span className="font-medium">Excel Spreadsheet</span>
                  {exportFormat === "excel" && (
                    <span className="ml-auto text-xs font-semibold text-green-600">
                      Selected
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-4">
        <SummaryCard
          icon={BookOpen}
          label="Total Titles"
          sublabel="Tổng số đầu sách"
          value={data.totalTitles.toString()}
          iconClassName="bg-blue-50 text-blue-600"
          accentColor="#2563EB"
        />
        <SummaryCard
          icon={Copy}
          label="Total Copies"
          sublabel="Tổng số bản sao"
          value={data.totalCopies.toString()}
          iconClassName="bg-purple-50 text-purple-600"
          accentColor="#7C3AED"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Collection Value"
          sublabel="Tổng giá trị tài sản"
          value={formatCurrency(data.totalCollectionValue)}
          iconClassName="bg-emerald-50 text-emerald-600"
          accentColor="#059669"
          className="sm:col-span-2 lg:col-span-1"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Borrowed Value"
          sublabel="Giá trị đang mượn"
          value={formatCurrency(data.borrowedValue)}
          iconClassName="bg-amber-50 text-amber-600"
          accentColor="#D97706"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Available Value"
          sublabel="Giá trị khả dụng"
          value={formatCurrency(data.availableValue)}
          iconClassName="bg-teal-50 text-teal-600"
          accentColor="#0D9488"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo sách, ISBN, thể loại..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              aria-label="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Search size={22} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            Không tìm thấy tài sản nào
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Không có đầu sách nào khớp với từ khóa "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-gray-800 cursor-pointer"
          >
            <RotateCcw size={13} />
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* Data Table View (Unified for Mobile & Desktop) */}
      {filteredBooks.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left font-semibold text-gray-700 min-w-[220px]"
                  >
                    Book
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 w-44 whitespace-nowrap"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 w-32 whitespace-nowrap"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 w-24 whitespace-nowrap"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 w-24 whitespace-nowrap"
                  >
                    Borrowed
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 w-24 whitespace-nowrap"
                  >
                    Available
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-right font-semibold text-gray-700 w-36 whitespace-nowrap"
                  >
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedBooks.map((book) => (
                  <tr
                    key={book.bookId}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5 min-w-[220px]">
                      <div
                        className="font-medium text-gray-900 leading-snug line-clamp-2"
                        title={book.title}
                      >
                        {book.title}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {book.isbn}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-center">
                      {book.category?.name ? (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {book.category.name}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-600 whitespace-nowrap tabular-nums">
                      {formatCurrency(book.price)}
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-600 whitespace-nowrap tabular-nums font-medium">
                      {book.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap tabular-nums">
                      <span
                        className={
                          book.borrowedQuantity > 0
                            ? "font-semibold text-amber-600"
                            : "text-gray-500"
                        }
                      >
                        {book.borrowedQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap tabular-nums">
                      <span
                        className={
                          book.availableQuantity > 0
                            ? "font-semibold text-teal-600"
                            : "text-gray-400"
                        }
                      >
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                      {formatCurrency(book.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unified Pagination Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-white px-4 py-3.5 sm:px-6">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">
                {filteredBooks.length > 0 ? startIndex + 1 : 0}
              </span>{" "}
              - <span className="font-semibold text-gray-900">{endIndex}</span>{" "}
              trên{" "}
              <span className="font-semibold text-gray-900">
                {filteredBooks.length}
              </span>{" "}
              đầu sách
            </p>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.max(1, safeCurrentPage - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const isActive = pageNum === safeCurrentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold tabular-nums transition cursor-pointer ${isActive
                              ? "bg-gray-900 text-white shadow-xs"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
