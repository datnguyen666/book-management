import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FolderOpen,
  RefreshCw,
  BookMarked,
  AlertCircle,
  TrendingUp,
  Flame,
  Sparkles,
  PieChart,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";

import { useDashboardSummary } from "@/hooks/use-dashboard";
import { getMediaUrl } from "@/lib/media";

const VI_MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

const VI_MONTH_FULL = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function DashboardPage() {
  const { data, isLoading, isError, isFetching, refetch } =
    useDashboardSummary();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleRefresh = async () => {
    const result = await refetch();
    if (!result.isError) {
      setLastUpdated(new Date());
    }
  };

  // Books added per month
  const monthlyData = data?.monthlyAcquisitions?.data ?? [];
  const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count), 1);
  const totalYearAcquisitions = monthlyData.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  // Borrowing activity per month
  const borrowingMonthlyData = data?.monthlyBorrowings?.data ?? [];
  const maxBorrowingMonthlyCount = Math.max(
    ...borrowingMonthlyData.map((item) => item.count),
    1,
  );
  const totalYearBorrowings = borrowingMonthlyData.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  // Category breakdown
  const categoryData = [...(data?.categoryBreakdown ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxCategoryCount = Math.max(
    ...categoryData.map((item) => item.count),
    1,
  );

  // Top borrowed books
  const topBorrowedBooks = data?.topBorrowedBooks ?? [];

  // Borrowing status
  const borrowingStatus = data?.borrowingStatus ?? {
    borrowing: 0,
    returned: 0,
  };
  const totalBorrowRecords =
    borrowingStatus.borrowing + borrowingStatus.returned;

  // Recent books
  const recentBooks = data?.recentBooks ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ========================================================= */}
      {/* 1. Page Header & Actions Toolbar */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
              Tổng quan thư viện
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Hệ thống trực tuyến
            </span>
          </div>
          <p className="!mt-1 text-xs sm:text-sm text-gray-600">
            Thống kê tình hình hoạt động, chỉ số lưu thông và vốn tài liệu của thư viện.
          </p>
        </div>

        {/* Toolbar: Refresh & Status */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          {lastUpdated && (
            <p className="text-xs text-gray-400 font-mono hidden md:block">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </p>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isFetching ? "animate-spin text-amber-600" : ""}
            />
            <span>{isFetching ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Skeleton Loading State */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-6">
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
              />
            ))}
          </div>

          {/* Charts Row 1 Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
          </div>

          {/* Charts Row 2 Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
          </div>

          {/* Tables Skeleton */}
          <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
          <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-white p-6" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. Error State */}
      {/* ========================================================= */}
      {isError && (
        <div className="max-w-2xl mx-auto my-8 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-2xs">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-rose-900">
            Không thể tải dữ liệu bảng điều khiển
          </h2>
          <p className="mt-2 text-sm text-rose-700 max-w-md">
            Hệ thống không thể kết nối đến máy chủ để lấy số liệu tổng quan. Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Thử tải lại
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Dashboard Main Content */}
      {/* ========================================================= */}
      {!isLoading && !isError && data && (
        <>
          {/* ======================================================= */}
          {/* 4.1 4 Primary KPI Summary Cards */}
          {/* ======================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Books */}
            <Link
              to="/books"
              className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                  Tổng đầu sách
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
                  {data.totalBooks.toLocaleString("vi-VN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                  <span>Tựa sách quản lý</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
                  />
                </div>
              </div>
            </Link>

            {/* Card 2: Total Categories */}
            <Link
              to="/categories"
              className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                  Danh mục thể loại
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                  <FolderOpen size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
                  {data.totalCategories.toLocaleString("vi-VN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                  <span>Thể loại sách</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600"
                  />
                </div>
              </div>
            </Link>

            {/* Card 3: Currently Borrowed */}
            <Link
              to="/borrow"
              className="group flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-amber-900 group-hover:text-amber-700 transition-colors">
                  Đang cho mượn
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                  <BookMarked size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums">
                  {data.currentlyBorrowed.toLocaleString("vi-VN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-amber-700/80">
                  <span>Sách bạn đọc đang mượn</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600"
                  />
                </div>
              </div>
            </Link>

            {/* Card 4: Overdue Books */}
            <Link
              to="/borrow"
              className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${data.overdue > 0
                  ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                  : "border-gray-200/80 bg-white hover:border-emerald-300"
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs sm:text-sm font-medium ${data.overdue > 0 ? "text-rose-900" : "text-gray-600"
                    }`}
                >
                  Sách quá hạn
                </span>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${data.overdue > 0
                      ? "bg-rose-100 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                    } group-hover:scale-110 transition-transform`}
                >
                  <AlertCircle size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p
                  className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${data.overdue > 0 ? "text-rose-700" : "text-emerald-700"
                    }`}
                >
                  {data.overdue.toLocaleString("vi-VN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs">
                  <span
                    className={
                      data.overdue > 0
                        ? "font-semibold text-rose-700"
                        : "text-emerald-700"
                    }
                  >
                    {data.overdue > 0
                      ? "Cần thu hồi gấp"
                      : "Lưu thông đúng hạn"}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${data.overdue > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* ======================================================= */}
          {/* 4.2 Analytics Grid 1: Acquisitions & Categories */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Books Added per Month */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <TrendingUp size={16} />
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Nhập sách theo tháng
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Số cuốn sách được bổ sung trong năm{" "}
                      {data.monthlyAcquisitions?.year ??
                        new Date().getFullYear()}
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    Tổng: {totalYearAcquisitions} cuốn
                  </span>
                </div>

                {/* Bar Chart Container */}
                <div className="mt-8 overflow-x-auto">
                  <div className="flex h-52 min-w-[340px] items-end gap-2 sm:gap-3 pt-6 pb-1">
                    {monthlyData.map((item) => {
                      const height =
                        item.count === 0
                          ? 4
                          : Math.max(
                            (item.count / maxMonthlyCount) * 100,
                            8,
                          );
                      const isPeak =
                        item.count === maxMonthlyCount && item.count > 0;

                      return (
                        <div
                          key={item.month}
                          className="group relative flex h-full flex-1 flex-col items-center justify-end"
                        >
                          {/* Tooltip on hover */}
                          <div className="pointer-events-none absolute -top-8 z-10 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow-md group-hover:block whitespace-nowrap">
                            {VI_MONTH_FULL[item.month - 1]}: {item.count} cuốn
                          </div>

                          {/* Bar Count */}
                          <span
                            className={`text-[10px] sm:text-[11px] font-semibold tabular-nums mb-1 transition-colors ${isPeak
                                ? "text-amber-700 font-bold"
                                : "text-gray-400 group-hover:text-gray-900"
                              }`}
                          >
                            {item.count > 0 ? item.count : "-"}
                          </span>

                          {/* Bar Graphic */}
                          <div className="flex h-full w-full items-end">
                            <div
                              style={{ height: `${height}%` }}
                              className={`w-full rounded-t-lg transition-all duration-300 ${isPeak
                                  ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-2xs"
                                  : "bg-slate-700/80 group-hover:bg-indigo-600"
                                }`}
                            />
                          </div>

                          {/* Month Label */}
                          <span
                            className={`mt-2 text-[11px] font-medium transition-colors ${isPeak
                                ? "font-bold text-amber-700"
                                : "text-gray-400 group-hover:text-gray-700"
                              }`}
                          >
                            {VI_MONTH_LABELS[item.month - 1] ?? item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Tháng cao điểm
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                  Các tháng trong năm
                </span>
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <PieChart size={16} />
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Phân loại theo thể loại
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Top 5 thể loại có số lượng tựa sách phong phú nhất
                    </p>
                  </div>

                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900"
                  >
                    Xem tất cả <ArrowUpRight size={13} />
                  </Link>
                </div>

                {/* Categories Progress List */}
                <div className="mt-6 space-y-4">
                  {categoryData.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400">
                      Chưa có dữ liệu thể loại sách.
                    </div>
                  )}

                  {categoryData.map((category, index) => {
                    const percentage =
                      category.count === 0
                        ? 0
                        : Math.round(
                          (category.count / maxCategoryCount) * 100,
                        );

                    return (
                      <div key={category.categoryId} className="group">
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${index === 0
                                  ? "bg-amber-100 text-amber-800"
                                  : index === 1
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              #{index + 1}
                            </span>
                            <span className="truncate font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                              {category.categoryName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-gray-900 tabular-nums">
                              {category.count} tựa sách
                            </span>
                            <span className="text-[11px] text-gray-400 tabular-nums w-10 text-right">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 flex">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${index === 0
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                                : "bg-purple-500/80 group-hover:bg-purple-600"
                              }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                Thống kê dựa trên danh mục đầu sách sẵn có trong hệ thống.
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 4.3 Analytics Grid 2: Borrowing Activity & Status */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 3: Borrowing Activity */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <BarChart3 size={16} />
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Hoạt động mượn sách theo tháng
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Tần suất bạn đọc mượn sách trong năm{" "}
                      {data.monthlyBorrowings?.year ??
                        new Date().getFullYear()}
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Tổng: {totalYearBorrowings} lượt
                  </span>
                </div>

                {/* Bar Chart Container */}
                <div className="mt-8 overflow-x-auto">
                  <div className="flex h-52 min-w-[340px] items-end gap-2 sm:gap-3 pt-6 pb-1">
                    {borrowingMonthlyData.map((item) => {
                      const height =
                        item.count === 0
                          ? 4
                          : Math.max(
                            (item.count / maxBorrowingMonthlyCount) * 100,
                            8,
                          );
                      const isPeak =
                        item.count === maxBorrowingMonthlyCount &&
                        item.count > 0;

                      return (
                        <div
                          key={item.month}
                          className="group relative flex h-full flex-1 flex-col items-center justify-end"
                        >
                          {/* Tooltip on hover */}
                          <div className="pointer-events-none absolute -top-8 z-10 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow-md group-hover:block whitespace-nowrap">
                            {VI_MONTH_FULL[item.month - 1]}: {item.count} lượt
                          </div>

                          {/* Bar Count */}
                          <span
                            className={`text-[10px] sm:text-[11px] font-semibold tabular-nums mb-1 transition-colors ${isPeak
                                ? "text-amber-700 font-bold"
                                : "text-gray-400 group-hover:text-gray-900"
                              }`}
                          >
                            {item.count > 0 ? item.count : "-"}
                          </span>

                          {/* Bar Graphic */}
                          <div className="flex h-full w-full items-end">
                            <div
                              style={{ height: `${height}%` }}
                              className={`w-full rounded-t-lg transition-all duration-300 ${isPeak
                                  ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-2xs"
                                  : "bg-slate-700/80 group-hover:bg-amber-600"
                                }`}
                            />
                          </div>

                          {/* Month Label */}
                          <span
                            className={`mt-2 text-[11px] font-medium transition-colors ${isPeak
                                ? "font-bold text-amber-700"
                                : "text-gray-400 group-hover:text-gray-700"
                              }`}
                          >
                            {VI_MONTH_LABELS[item.month - 1] ?? item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Tháng mượn cao điểm
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                  Các tháng trong năm
                </span>
              </div>
            </div>

            {/* Chart 4: Borrowing Status */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <BookMarked size={16} />
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Tình trạng lưu thông mượn trả
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Tỷ lệ giữa số phiếu đang mượn và số phiếu đã hoàn trả
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    Tổng: {totalBorrowRecords} hồ sơ
                  </span>
                </div>

                {totalBorrowRecords === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-400">
                    Chưa có hồ sơ mượn trả nào.
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    {/* Proportion Segmented Bar */}
                    <div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 flex p-0.5 gap-0.5">
                        <div
                          style={{
                            width: `${(borrowingStatus.borrowing / totalBorrowRecords) * 100}%`,
                          }}
                          className="h-full rounded-l-full bg-amber-500 transition-all duration-500"
                          title={`Đang mượn: ${borrowingStatus.borrowing}`}
                        />
                        <div
                          style={{
                            width: `${(borrowingStatus.returned / totalBorrowRecords) * 100}%`,
                          }}
                          className="h-full rounded-r-full bg-emerald-500 transition-all duration-500"
                          title={`Đã trả: ${borrowingStatus.returned}`}
                        />
                      </div>
                    </div>

                    {/* Stat Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {/* Subcard 1: Borrowing */}
                      <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Đang cho mượn
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-amber-900 tabular-nums">
                          {borrowingStatus.borrowing}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-700/80">
                          {(
                            (borrowingStatus.borrowing / totalBorrowRecords) *
                            100
                          ).toFixed(0)}
                          % trên tổng số
                        </p>
                      </div>

                      {/* Subcard 2: Returned */}
                      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Đã hoàn trả
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-emerald-900 tabular-nums">
                          {borrowingStatus.returned}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700/80">
                          {(
                            (borrowingStatus.returned / totalBorrowRecords) *
                            100
                          ).toFixed(0)}
                          % trên tổng số
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overdue Alert Banner at bottom */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                {data.overdue > 0 ? (
                  <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>
                        Có{" "}
                        <strong className="font-bold">{data.overdue} cuốn sách</strong>{" "}
                        đã quá hạn trả cần nhắc nhở bạn đọc.
                      </span>
                    </div>
                    <Link
                      to="/borrow"
                      className="font-bold text-rose-700 hover:text-rose-900 shrink-0 ml-2 underline"
                    >
                      Xử lý ngay →
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Hiện không có cuốn sách nào bị quá hạn trả.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 4.4 Top Borrowed Books Section */}
          {/* ======================================================= */}
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/80 text-amber-700 shadow-2xs">
                  <Trophy size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Top sách mượn nhiều nhất
                  </h2>
                  <p className="text-xs text-gray-500">
                    Những cuốn sách được bạn đọc yêu thích và mượn đọc nhiều nhất
                  </p>
                </div>
              </div>

              <Link
                to="/books"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Khám phá kho sách <ArrowUpRight size={13} />
              </Link>
            </div>

            {topBorrowedBooks.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                Chưa có dữ liệu ghi nhận lượt mượn sách.
              </div>
            ) : (
              <>
                {/* Desktop Table View (≥ md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/75 text-xs font-semibold text-gray-700 border-b border-gray-200/80">
                      <tr>
                        <th scope="col" className="px-6 py-3.5 w-16 text-center">
                          Hạng
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Tựa sách
                        </th>
                        <th scope="col" className="px-6 py-3.5 w-48">
                          Mã ISBN
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-right w-40 whitespace-nowrap"
                        >
                          Số lượt mượn
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {topBorrowedBooks.map((book, index) => {
                        const isGold = index === 0;
                        const isSilver = index === 1;
                        const isBronze = index === 2;

                        return (
                          <tr
                            key={book.bookId}
                            className="transition-colors hover:bg-amber-50/25"
                          >
                            {/* Rank Badge */}
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isGold
                                    ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
                                    : isSilver
                                      ? "bg-slate-100 text-slate-700 ring-2 ring-slate-300"
                                      : isBronze
                                        ? "bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                                        : "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                {index + 1}
                              </span>
                            </td>

                            {/* Book Title */}
                            <td className="px-6 py-4">
                              <Link
                                to={`/books/${book.bookId}`}
                                className="font-bold text-gray-900 hover:text-amber-800 transition-colors line-clamp-1"
                                title={book.title}
                              >
                                {book.title}
                              </Link>
                            </td>

                            {/* ISBN */}
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-gray-500">
                                {book.isbn}
                              </span>
                            </td>

                            {/* Count */}
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200/60 tabular-nums">
                                <Flame size={13} className="text-amber-600" />
                                {book.count} lượt
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (< md) */}
                <div className="md:hidden divide-y divide-gray-100 p-2">
                  {topBorrowedBooks.map((book, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;

                    return (
                      <Link
                        key={book.bookId}
                        to={`/books/${book.bookId}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${isGold
                                ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
                                : isSilver
                                  ? "bg-slate-100 text-slate-700 ring-2 ring-slate-300"
                                  : isBronze
                                    ? "bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h4
                              className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1"
                              title={book.title}
                            >
                              {book.title}
                            </h4>
                            <span className="text-[11px] font-mono text-gray-400">
                              {book.isbn}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shrink-0 tabular-nums">
                          <Flame size={12} className="text-amber-600" />
                          {book.count} lượt
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ======================================================= */}
          {/* 4.5 Recently Added Books Section */}
          {/* ======================================================= */}
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Sách mới bổ sung gần đây
                  </h2>
                  <p className="text-xs text-gray-500">
                    Các tựa sách vừa được cập nhật vào danh mục thư viện
                  </p>
                </div>
              </div>

              <Link
                to="/books"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Xem tất cả sách <ArrowUpRight size={13} />
              </Link>
            </div>

            {recentBooks.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                Chưa có đầu sách nào mới được bổ sung.
              </div>
            ) : (
              <>
                {/* Desktop Table View (≥ md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/75 text-xs font-semibold text-gray-700 border-b border-gray-200/80">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">
                          Đầu sách & Bìa sách
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Tác giả
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-center">
                          Thể loại
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right whitespace-nowrap">
                          Ngày bổ sung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {recentBooks.map((book) => {
                        const coverUrl = getMediaUrl(book.coverImage);

                        return (
                          <tr
                            key={book.id}
                            className="transition-colors hover:bg-amber-50/25"
                          >
                            {/* Book Title & Cover */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {coverUrl ? (
                                  <img
                                    src={coverUrl}
                                    alt={book.title}
                                    className="h-12 w-9 rounded-md object-cover shadow-2xs border border-gray-200 shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400 border border-gray-200">
                                    <BookOpen size={16} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    to={`/books/${book.id}`}
                                    className="font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                                    title={book.title}
                                  >
                                    {book.title}
                                  </Link>
                                  <span className="font-mono text-xs text-gray-400">
                                    ISBN: {book.isbn}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Author */}
                            <td className="px-6 py-4 font-medium text-gray-700">
                              {book.author}
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                {book.category?.name ?? "Chưa phân loại"}
                              </span>
                            </td>

                            {/* Created At */}
                            <td className="px-6 py-4 text-right text-xs text-gray-500 tabular-nums">
                              {formatDate(book.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (< md) */}
                <div className="md:hidden divide-y divide-gray-100 p-2">
                  {recentBooks.map((book) => {
                    const coverUrl = getMediaUrl(book.coverImage);

                    return (
                      <Link
                        key={book.id}
                        to={`/books/${book.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.title}
                            className="h-14 w-10 rounded-md object-cover shadow-2xs border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400 border border-gray-200">
                            <BookOpen size={18} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4
                            className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1"
                            title={book.title}
                          >
                            {book.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {book.author}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">
                              {book.category?.name ?? "Chưa phân loại"}
                            </span>
                            <span className="text-gray-400 tabular-nums">
                              {formatDate(book.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
