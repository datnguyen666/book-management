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
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Layers,
  BookMarked,
  PieChart,
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

export function LibraryAssetsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useAssets();

  // Export dropdown state
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "AVAILABLE" | "BORROWED" | "OUT_OF_STOCK"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "TOTAL_VALUE_DESC" | "TOTAL_VALUE_ASC" | "QUANTITY_DESC" | "TITLE_ASC"
  >("TOTAL_VALUE_DESC");

  // View mode: 'auto' adapts by screen size (cards on mobile, table on desktop)
  // or user can explicitly toggle 'table' vs 'grid'
  const [viewMode, setViewMode] = useState<"auto" | "table" | "grid">("auto");

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique categories from dataset
  const categories = useMemo(() => {
    if (!data?.data) return [];
    const map = new Map<number, string>();
    for (const book of data.data) {
      if (book.category?.id && book.category?.name) {
        map.set(book.category.id, book.category.name);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [data]);

  // Asset Value breakdown ratios
  const totalVal = data?.totalCollectionValue || 0;
  const availVal = data?.availableValue || 0;
  const borrowVal = data?.borrowedValue || 0;
  const availablePercent =
    totalVal > 0 ? Math.round((availVal / totalVal) * 100) : 0;
  const borrowedPercent = totalVal > 0 ? 100 - availablePercent : 0;

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    if (!data?.data) return [];
    let list = [...data.data];

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((book) => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const isbnMatch = book.isbn.toLowerCase().includes(query);
        const categoryMatch = book.category?.name?.toLowerCase().includes(query);
        return titleMatch || isbnMatch || categoryMatch;
      });
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      const categoryId = Number(selectedCategory);
      list = list.filter((book) => book.category?.id === categoryId);
    }

    // Status filter
    if (selectedStatus === "BORROWED") {
      list = list.filter((book) => book.borrowedQuantity > 0);
    } else if (selectedStatus === "AVAILABLE") {
      list = list.filter((book) => book.availableQuantity > 0);
    } else if (selectedStatus === "OUT_OF_STOCK") {
      list = list.filter((book) => book.availableQuantity === 0);
    }

    // Sort order
    list.sort((a, b) => {
      switch (sortBy) {
        case "TOTAL_VALUE_DESC":
          return b.totalValue - a.totalValue;
        case "TOTAL_VALUE_ASC":
          return a.totalValue - b.totalValue;
        case "QUANTITY_DESC":
          return b.quantity - a.quantity;
        case "TITLE_ASC":
          return a.title.localeCompare(b.title, "vi");
        default:
          return 0;
      }
    });

    return list;
  }, [data, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredAndSortedBooks.length,
  );

  const paginatedBooks = useMemo(() => {
    return filteredAndSortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBooks, startIndex]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    sortBy !== "TOTAL_VALUE_DESC";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSortBy("TOTAL_VALUE_DESC");
    setCurrentPage(1);
  };

  const handleExport = (format: "pdf" | "excel") => {
    if (!data) return;
    setExportFormat(format);
    if (format === "pdf") {
      exportAssetsToPdf(data);
    } else {
      exportAssetsToExcel(data);
    }
    setIsExportMenuOpen(false);
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200" />
            <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-80 animate-pulse rounded-md bg-gray-200" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-200" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />

        {/* 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
            />
          ))}
        </div>

        {/* Filter bar Skeleton */}
        <div className="h-14 animate-pulse rounded-xl border border-gray-200 bg-white" />

        {/* Content list Skeleton */}
        <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto mt-12 flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4 shadow-2xs">
          <TrendingDown size={28} />
        </div>
        <h2 className="text-lg font-bold text-red-900">
          Không thể tải dữ liệu tài sản thư viện
        </h2>
        <p className="mt-2 text-sm text-red-700 max-w-md">
          Hệ thống gặp sự cố khi đồng bộ số liệu tài sản sách. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 cursor-pointer"
        >
          <RefreshCw size={16} />
          Thử tải lại dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ========================================================= */}
      {/* 1. Header & Actions Toolbar */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/80 transition cursor-pointer"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Quay lại trang trước</span>
          </button>
        </div>

        {/* Title & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
                Tài sản thư viện
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
                <Layers size={12} />
                Báo cáo tài sản & lưu thông
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Tổng quan định giá tài sản, tỷ lệ lưu thông và phân bổ giá trị sách trong hệ thống.
            </p>
          </div>

          {/* Action Group: Refetch & Export */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Cập nhật số liệu mới nhất"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-2xs hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin text-amber-600" : ""}
              />
            </button>

            {/* Export Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              {isExportMenuOpen && (
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsExportMenuOpen(false)}
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                onClick={() => setIsExportMenuOpen((open) => !open)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 transition cursor-pointer active:scale-[0.98]"
              >
                <Download size={16} className="text-amber-400" />
                <span>Xuất báo cáo</span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${isExportMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Popover */}
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-xl transition-all">
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Định dạng xuất báo cáo
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExport("pdf")}
                    className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          Tài liệu PDF
                        </span>
                        {exportFormat === "pdf" && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug">
                        Định dạng in ấn chuẩn, căn chỉnh trang đẹp mắt.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport("excel")}
                    className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50 cursor-pointer mt-0.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          Bảng tính Excel (.xlsx)
                        </span>
                        {exportFormat === "excel" && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug">
                        Chứa dữ liệu chi tiết từng đầu sách để tính toán.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Hero Asset Card: Total Value & Visual Allocation */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20 p-5 sm:p-6 shadow-xs">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-400/10 blur-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Total Value Display */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600/10 text-amber-700">
                <DollarSign size={16} />
              </span>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-900/80">
                Tổng giá trị tài sản sách
              </p>
            </div>
            <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black tracking-tight text-gray-900 tabular-nums">
              {formatCurrency(totalVal)}
            </p>
            <p className="!mt-3 text-xs text-gray-500">
              Định giá tài sản dựa trên {data.totalCopies} cuốn sách thuộc{" "}
              {data.totalTitles} tựa sách khác nhau.
            </p>
          </div>

          {/* Asset Allocation Breakdown */}
          <div className="w-full lg:max-w-md xl:max-w-lg rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2.5">
              <span className="flex items-center gap-1.5">
                <PieChart size={14} className="text-amber-600" />
                Tỷ lệ phân bổ tài sản
              </span>
              <span className="text-gray-400 font-mono text-[11px]">100% tài sản</span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 flex p-0.5 gap-0.5">
              <div
                style={{ width: `${availablePercent}%` }}
                className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                title={`Khả dụng: ${availablePercent}% (${formatCurrency(availVal)})`}
              />
              <div
                style={{ width: `${borrowedPercent}%` }}
                className="h-full rounded-r-full bg-amber-500 transition-all duration-500"
                title={`Đang mượn: ${borrowedPercent}% (${formatCurrency(borrowVal)})`}
              />
            </div>

            {/* Legend Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 leading-none">
                    Khả dụng tại thư viện
                  </p>
                  <p className="mt-1 font-bold text-gray-900 tabular-nums">
                    {formatCurrency(availVal)}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {availablePercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 border-l border-gray-100 pl-2">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 leading-none">
                    Đang được mượn
                  </p>
                  <p className="mt-1 font-bold text-gray-900 tabular-nums">
                    {formatCurrency(borrowVal)}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                    {borrowedPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 4 Metric KPI Cards */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Titles */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Tổng đầu sách
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
              {data.totalTitles.toLocaleString("vi-VN")}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-gray-400">
              Tựa sách đang quản lý
            </p>
          </div>
        </div>

        {/* Card 2: Total Copies */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Tổng số bản sao
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Copy size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
              {data.totalCopies.toLocaleString("vi-VN")}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-gray-400">
              Tổng số cuốn trong thư viện
            </p>
          </div>
        </div>

        {/* Card 3: Borrowed Value */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-200/70 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition hover:border-amber-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-amber-900 truncate">
              Giá trị đang mượn
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold text-amber-800 tabular-nums truncate">
              {formatCurrency(data.borrowedValue)}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-amber-600/80">
              {borrowedPercent}% giá trị lưu thông
            </p>
          </div>
        </div>

        {/* Card 4: Available Value */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/70 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition hover:border-emerald-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-emerald-900 truncate">
              Giá trị sẵn sàng
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold text-emerald-800 tabular-nums truncate">
              {formatCurrency(data.availableValue)}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-emerald-600/80">
              {availablePercent}% sẵn sàng phục vụ
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. Filter, Search & View Controls Bar */}
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên sách, mã ISBN, thể loại..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls Group: Category, Status, Sort & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">Tất cả thể loại ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(
                  e.target.value as
                  | "ALL"
                  | "AVAILABLE"
                  | "BORROWED"
                  | "OUT_OF_STOCK",
                );
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">Có sẵn tại thư viện</option>
              <option value="BORROWED">Đang có sách được mượn</option>
              <option value="OUT_OF_STOCK">Hết sách sẵn sàng</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value as
                  | "TOTAL_VALUE_DESC"
                  | "TOTAL_VALUE_ASC"
                  | "QUANTITY_DESC"
                  | "TITLE_ASC",
                );
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs sm:text-sm font-medium text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="TOTAL_VALUE_DESC">Tổng giá trị (Cao → Thấp)</option>
              <option value="TOTAL_VALUE_ASC">Tổng giá trị (Thấp → Cao)</option>
              <option value="QUANTITY_DESC">Số lượng sách (Nhiều → Ít)</option>
              <option value="TITLE_ASC">Tên sách (A → Z)</option>
            </select>

            {/* View Mode Switcher (Tablet & Desktop) */}
            <div className="hidden sm:flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${viewMode === "table" || viewMode === "auto"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
                title="Chế độ xem bảng"
              >
                <TableIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
                title="Chế độ xem thẻ"
              >
                <LayoutGrid size={16} />
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
                {filteredAndSortedBooks.length}
              </strong>{" "}
              / {data.data.length} đầu sách phù hợp
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
      {/* 5. Empty State */}
      {/* ========================================================= */}
      {filteredAndSortedBooks.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 sm:p-14 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-2xs">
            <Search size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900">
            Không tìm thấy tài sản sách phù hợp
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Không có đầu sách nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại của bạn.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 cursor-pointer"
          >
            <RotateCcw size={14} />
            Xóa bộ lọc & xem tất cả
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. Mobile Card View (< md OR viewMode === 'grid') */}
      {/* ========================================================= */}
      {filteredAndSortedBooks.length > 0 && (
        <div
          className={`${viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            : viewMode === "table"
              ? "hidden"
              : "grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden"
            }`}
        >
          {paginatedBooks.map((book) => {
            const availRatio =
              book.quantity > 0
                ? Math.round((book.availableQuantity / book.quantity) * 100)
                : 0;

            return (
              <div
                key={book.bookId}
                className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs hover:shadow-xs transition hover:border-gray-300"
              >
                <div>
                  {/* Category & ISBN */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                      {book.category?.name || "Chưa phân loại"}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {book.isbn}
                    </span>
                  </div>

                  {/* Title */}
                  <h4
                    className="mt-2 text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug"
                    title={book.title}
                  >
                    {book.title}
                  </h4>

                  {/* Metrics Box */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-gray-50/80 p-2.5 text-xs">
                    <div>
                      <p className="text-[11px] text-gray-500">Đơn giá sách</p>
                      <p className="mt-0.5 font-semibold text-gray-800 tabular-nums">
                        {formatCurrency(book.price)}
                      </p>
                    </div>
                    <div className="border-l border-gray-200/80 pl-2">
                      <p className="text-[11px] text-gray-500">Tổng giá trị</p>
                      <p className="mt-0.5 font-bold text-amber-800 tabular-nums">
                        {formatCurrency(book.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Stock Progress */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-600">
                      Tổng số bản:{" "}
                      <strong className="text-gray-900 font-bold">
                        {book.quantity} cuốn
                      </strong>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {book.availableQuantity} có sẵn
                    </span>
                  </div>

                  {/* Mini Availability Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/70 flex">
                    <div
                      style={{ width: `${availRatio}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all"
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Sẵn sàng: {book.availableQuantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Đang mượn: {book.borrowedQuantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. Desktop Table View (≥ md AND viewMode !== 'grid') */}
      {/* ========================================================= */}
      {filteredAndSortedBooks.length > 0 && (
        <div
          className={`${viewMode === "grid"
            ? "hidden"
            : viewMode === "table"
              ? "block"
              : "hidden md:block"
            } overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200/80 bg-gray-50/75 text-xs font-semibold text-gray-700">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Đầu sách & Mã ISBN
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center whitespace-nowrap">
                    Thể loại
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                    Đơn giá
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center whitespace-nowrap">
                    Tổng số bản
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center whitespace-nowrap">
                    Tình trạng lưu thông
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right whitespace-nowrap">
                    Tổng giá trị tài sản
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedBooks.map((book) => {
                  const availRatio =
                    book.quantity > 0
                      ? Math.round(
                        (book.availableQuantity / book.quantity) * 100,
                      )
                      : 0;

                  return (
                    <tr
                      key={book.bookId}
                      className="transition-colors hover:bg-amber-50/25"
                    >
                      {/* Book info */}
                      <td className="px-5 py-3.5 max-w-xs xl:max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <BookMarked size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="font-bold text-gray-900 leading-snug line-clamp-2"
                              title={book.title}
                            >
                              {book.title}
                            </p>
                            <span className="mt-0.5 inline-block text-xs font-mono text-gray-400">
                              {book.isbn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {book.category?.name ? (
                          <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {book.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3.5 text-right font-medium text-gray-700 whitespace-nowrap tabular-nums">
                        {formatCurrency(book.price)}
                      </td>

                      {/* Total Quantity */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap tabular-nums font-bold text-gray-900">
                        {book.quantity}
                      </td>

                      {/* Circulation (Borrowed vs Available) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1 w-36">
                          <div className="flex items-center justify-between w-full text-xs">
                            <span className="font-semibold text-emerald-700">
                              {book.availableQuantity} sẵn
                            </span>
                            <span className="font-semibold text-amber-700">
                              {book.borrowedQuantity} mượn
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="h-1.5 w-full rounded-full bg-amber-200/70 overflow-hidden flex">
                            <div
                              style={{ width: `${availRatio}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                              title={`Khả dụng: ${book.availableQuantity}/${book.quantity}`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Value */}
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap tabular-nums">
                        <span className="text-sm font-extrabold text-amber-900">
                          {formatCurrency(book.totalValue)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Unified Pagination inside table container */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200/80 bg-gray-50/50 px-4 sm:px-6 py-3.5">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Hiển thị{" "}
              <strong className="text-gray-900 font-semibold">
                {startIndex + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-gray-900 font-semibold">
                {endIndex}
              </strong>{" "}
              trên{" "}
              <strong className="text-gray-900 font-semibold">
                {filteredAndSortedBooks.length}
              </strong>{" "}
              đầu sách
            </p>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
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
                          className={`h-8 min-w-8 rounded-xl px-2 text-xs font-bold tabular-nums transition cursor-pointer ${isActive
                            ? "bg-gray-900 text-white shadow-xs"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
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
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standalone Pagination for Mobile / Card Grid View */}
      {filteredAndSortedBooks.length > 0 &&
        (viewMode === "grid" || viewMode === "auto") && (
          <div
            className={`${viewMode === "grid" ? "flex" : "flex md:hidden"
              } flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs`}
          >
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Hiển thị{" "}
              <strong className="text-gray-900 font-semibold">
                {startIndex + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-gray-900 font-semibold">{endIndex}</strong>{" "}
              trên{" "}
              <strong className="text-gray-900 font-semibold">
                {filteredAndSortedBooks.length}
              </strong>{" "}
              đầu sách
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="flex h-9 px-3 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <span className="text-xs font-bold text-gray-900 px-2 tabular-nums">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                  className="flex h-9 px-3 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
