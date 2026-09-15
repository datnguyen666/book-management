import { useState } from "react";
import {
  BookOpen,
  FolderOpen,
  RefreshCw,
  CalendarDays,
  BookMarked,
  AlertCircle,
} from "lucide-react";

import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useNavigate } from "react-router-dom";

interface SummaryCard {
  title: string;
  value: number;
  description: string;
  icon: typeof BookOpen;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const INK = "#12192B";
const BRASS = "#B8863B";
const BORDER = "#E6DFCE";
const MUTED = "#8A93A6";
const OVERDUE = "#9c351d";

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

  const summaryCards: SummaryCard[] = [
    {
      title: "Total Title Books",
      value: data?.totalBooks ?? 0,
      description: "Books managed in the library",
      icon: BookOpen,
    },
    {
      title: "Total Categories",
      value: data?.totalCategories ?? 0,
      description: "Categories available",
      icon: FolderOpen,
    },
    {
      title: "Currently Borrowed",
      value: data?.currentlyBorrowed ?? 0,
      description: "Books currently borrowed",
      icon: BookMarked,
    },
    {
      title: "Overdue",
      value: data?.overdue ?? 0,
      description: "Books past their due date",
      icon: AlertCircle,
    },
  ];

  const navigate = useNavigate();

  // Books added per month
  const monthlyData = data?.monthlyAcquisitions?.data ?? [];

  const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count), 1);

  // Borrowing activity per month
  const borrowingMonthlyData = data?.monthlyBorrowings?.data ?? [];

  const maxBorrowingMonthlyCount = Math.max(
    ...borrowingMonthlyData.map((item) => item.count),
    1,
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

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "'Source Serif 4', serif", color: INK }}
          >
            Overview
          </h1>

          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Here's what's happening with your library.
          </p>

          {lastUpdated && (
            <p
              className="mt-2 text-xs"
              style={{
                color: "#B0B7C4",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium transition hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ border: `1px solid ${BORDER}`, color: INK }}
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />

          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <>
          {/* Summary loading */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="h-4 w-28 animate-pulse rounded bg-[#EFE9DA]" />

                    <div className="mt-3 h-10 w-20 animate-pulse rounded bg-[#EFE9DA]" />

                    <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[#F4EFE2]" />
                  </div>

                  <div className="h-11 w-11 animate-pulse rounded-full bg-[#EFE9DA]" />
                </div>
              </div>
            ))}
          </div>

          {/* Analytics loading */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div
              className="h-80 animate-pulse rounded-lg bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            />

            <div
              className="h-80 animate-pulse rounded-lg bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            />
          </div>

          {/* Borrowing analytics loading */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div
              className="h-80 animate-pulse rounded-lg bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            />

            <div
              className="h-80 animate-pulse rounded-lg bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            />
          </div>

          {/* Top borrowed books loading */}
          <div
            className="h-72 animate-pulse rounded-lg bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          />

          {/* Recent books loading */}
          <div
            className="h-72 animate-pulse rounded-lg bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          />
        </>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-lg p-5"
          style={{
            border: `1px solid ${OVERDUE}33`,
            backgroundColor: "#FBEFEC",
          }}
        >
          <p className="text-sm font-medium" style={{ color: OVERDUE }}>
            Failed to load dashboard data.
          </p>

          <p className="mt-1 text-xs" style={{ color: "#C1705C" }}>
            Please check the server connection and try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="mt-4 rounded-md bg-white px-3 py-2 text-xs font-medium transition hover:bg-[#FBEFEC] disabled:opacity-50"
            style={{ border: `1px solid ${OVERDUE}55`, color: OVERDUE }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Dashboard content */}
      {!isLoading && !isError && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const isOverdue = card.title === "Overdue" && card.value > 0;

              return (
                <div
                  key={card.title}
                  className="flex h-full flex-col rounded-lg bg-white p-6 transition-colors"
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderTop: `2px solid ${isOverdue ? OVERDUE : BRASS}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="pr-6">
                      <p
                        className="text-sm font-medium"
                        style={{ color: MUTED }}
                      >
                        {card.title}
                      </p>

                      <p
                        className="mt-2 text-4xl font-semibold tabular-nums"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          color: isOverdue ? OVERDUE : INK,
                        }}
                      >
                        {card.value}
                      </p>
                    </div>

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        border: `1px solid ${isOverdue ? OVERDUE + "55" : BRASS + "55"}`,
                        color: isOverdue ? OVERDUE : BRASS,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  <p
                    className="mt-3 truncate text-xs"
                    style={{ color: "#B0B7C4" }}
                  >
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Books Added per Month */}
            <div
              className="rounded-lg bg-white p-6"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: INK }}
                  >
                    Books Added per Month
                  </h2>

                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Books added during {data.monthlyAcquisitions.year}
                  </p>
                </div>

                <BookOpen size={18} style={{ color: BRASS }} />
              </div>

              <div className="mt-8 overflow-x-auto">
                <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3">
                  {monthlyData.map((item) => {
                    const height =
                      item.count === 0
                        ? 4
                        : Math.max((item.count / maxMonthlyCount) * 100, 8);
                    const isPeak =
                      item.count === maxMonthlyCount && item.count > 0;

                    return (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span
                          className="text-[10px] font-medium tabular-nums"
                          style={{ color: MUTED }}
                        >
                          {item.count}
                        </span>

                        <div className="flex h-full w-full items-end">
                          <div
                            className="w-full rounded-t-sm transition-all duration-300"
                            style={{
                              height: `${height}%`,
                              backgroundColor: isPeak ? BRASS : INK,
                              minHeight: "4px",
                            }}
                          />
                        </div>

                        <span
                          className="text-[10px]"
                          style={{ color: "#B0B7C4" }}
                        >
                          {MONTH_LABELS[item.month - 1] ?? item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Breakdown By Category */}
            <div
              className="rounded-lg bg-white p-6"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: INK }}
                  >
                    Breakdown By Category
                  </h2>

                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Number of books in each category
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/categories")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[#F7F2E7]"
                  style={{ border: `1px solid ${BORDER}`, color: BRASS }}
                >
                  <FolderOpen size={16} />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {categoryData.length === 0 && (
                  <p
                    className="py-10 text-center text-sm"
                    style={{ color: MUTED }}
                  >
                    No category data available.
                  </p>
                )}

                {categoryData.map((category) => {
                  const percentage =
                    category.count === 0
                      ? 0
                      : (category.count / maxCategoryCount) * 100;

                  return (
                    <div key={category.categoryId}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span
                          className="truncate text-sm font-medium"
                          style={{ color: "#374151" }}
                        >
                          {category.categoryName}
                        </span>

                        <span
                          className="shrink-0 text-xs font-semibold tabular-nums"
                          style={{ color: MUTED }}
                        >
                          {category.count}
                        </span>
                      </div>

                      <div
                        className="h-1.5 overflow-hidden rounded-full"
                        style={{ backgroundColor: "#F0EADA" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: INK,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Borrowing Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Borrowing Activity */}
            <div
              className="rounded-lg bg-white p-6"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: INK }}
                  >
                    Borrowing Activity
                  </h2>

                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Books borrowed during {data.monthlyBorrowings.year}
                  </p>
                </div>

                <BookMarked size={18} style={{ color: BRASS }} />
              </div>

              <div className="mt-8 overflow-x-auto">
                <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3">
                  {borrowingMonthlyData.map((item) => {
                    const height =
                      item.count === 0
                        ? 4
                        : Math.max(
                            (item.count / maxBorrowingMonthlyCount) * 100,
                            8,
                          );
                    const isPeak =
                      item.count === maxBorrowingMonthlyCount && item.count > 0;

                    return (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span
                          className="text-[10px] font-medium tabular-nums"
                          style={{ color: MUTED }}
                        >
                          {item.count}
                        </span>

                        <div className="flex h-full w-full items-end">
                          <div
                            className="w-full rounded-t-sm transition-all duration-300"
                            style={{
                              height: `${height}%`,
                              backgroundColor: isPeak ? BRASS : INK,
                              minHeight: "4px",
                            }}
                          />
                        </div>

                        <span
                          className="text-[10px]"
                          style={{ color: "#B0B7C4" }}
                        >
                          {MONTH_LABELS[item.month - 1] ?? item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Borrowing Status */}
            <div
              className="rounded-lg bg-white p-6"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: INK }}
                  >
                    Borrowing Status
                  </h2>

                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Current status of all borrow records
                  </p>
                </div>

                <BookMarked size={18} style={{ color: BRASS }} />
              </div>

              {totalBorrowRecords === 0 ? (
                <div
                  className="flex h-56 items-center justify-center text-sm"
                  style={{ color: MUTED }}
                >
                  No borrowing records yet.
                </div>
              ) : (
                <>
                  {/* Combined proportion bar */}
                  <div
                    className="mt-8 flex h-3 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "#F0EADA" }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(borrowingStatus.borrowing / totalBorrowRecords) * 100}%`,
                        backgroundColor: INK,
                      }}
                    />

                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(borrowingStatus.returned / totalBorrowRecords) * 100}%`,
                        backgroundColor: BRASS,
                      }}
                    />
                  </div>

                  {/* Stat breakdown */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: "#F7F2E7" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: INK }}
                        />

                        <span
                          className="text-xs font-medium"
                          style={{ color: MUTED }}
                        >
                          Currently Borrowed
                        </span>
                      </div>

                      <p
                        className="mt-2 text-2xl font-semibold tabular-nums"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          color: INK,
                        }}
                      >
                        {borrowingStatus.borrowing}
                      </p>

                      <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
                        {(
                          (borrowingStatus.borrowing / totalBorrowRecords) *
                          100
                        ).toFixed(0)}
                        % of total
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: "#F7F2E7" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: BRASS }}
                        />

                        <span
                          className="text-xs font-medium"
                          style={{ color: MUTED }}
                        >
                          Returned
                        </span>
                      </div>

                      <p
                        className="mt-2 text-2xl font-semibold tabular-nums"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          color: INK,
                        }}
                      >
                        {borrowingStatus.returned}
                      </p>

                      <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
                        {(
                          (borrowingStatus.returned / totalBorrowRecords) *
                          100
                        ).toFixed(0)}
                        % of total
                      </p>
                    </div>
                  </div>

                  {/* Overdue + total */}
                  <div
                    className="mt-6 flex items-center justify-between pt-5"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        size={16}
                        style={{
                          color: data.overdue > 0 ? OVERDUE : "#C7CCD6",
                        }}
                      />

                      <span
                        className="text-xs"
                        style={{
                          color: data.overdue > 0 ? OVERDUE : MUTED,
                          fontWeight: data.overdue > 0 ? 600 : 400,
                        }}
                      >
                        {data.overdue > 0
                          ? `${data.overdue} book${data.overdue > 1 ? "s" : ""} overdue`
                          : "No overdue books"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs" style={{ color: MUTED }}>
                        Total records
                      </span>{" "}
                      <span
                        className="text-lg font-semibold tabular-nums"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          color: INK,
                        }}
                      >
                        {totalBorrowRecords}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top Borrowed Books */}
          <div
            className="rounded-lg bg-white rounded-lg bg-white shadow-[0_1px_3px_rgba(18,25,43,0.06),0_8px_24px_-12px_rgba(18,25,43,0.12)]"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ color: INK }}>
                  Top Borrowed Books
                </h2>

                <p className="mt-1 text-xs" style={{ color: MUTED }}>
                  Most borrowed books in the library
                </p>
              </div>

              <BookMarked size={18} style={{ color: BRASS }} />
            </div>

            {topBorrowedBooks.length === 0 ? (
              <div
                className="p-10 text-center text-sm"
                style={{ color: MUTED }}
              >
                No borrowing records yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead
                    style={{
                      backgroundColor: "#EFE3C4",
                      borderBottom: "1px solid #D8CEB2",
                    }}
                  >
                    <tr>
                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        #
                      </th>

                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Book
                      </th>

                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        ISBN
                      </th>

                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Borrow Count
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {topBorrowedBooks.map((book, index) => (
                      <tr
                        key={book.bookId}
                        className="transition-colors hover:bg-[#FAF7EF]"
                        style={{ borderTop: `1px solid ${BORDER}` }}
                      >
                        <td className="px-6 py-4" style={{ color: "#B0B7C4" }}>
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div
                            className="max-w-[360px] truncate font-medium"
                            style={{ color: INK }}
                          >
                            {book.title}
                          </div>
                        </td>

                        <td className="px-6 py-4" style={{ color: "#6B7280" }}>
                          {book.isbn}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: INK }}
                          >
                            {book.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recently Added Books */}
          <div
            className="overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(18,25,43,0.06),0_8px_24px_-12px_rgba(18,25,43,0.12)]"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ color: INK }}>
                  Recently Added Books
                </h2>

                <p className="mt-1 text-xs" style={{ color: MUTED }}>
                  The latest books added to the library
                </p>
              </div>

              <CalendarDays size={18} style={{ color: BRASS }} />
            </div>

            {data.recentBooks.length === 0 ? (
              <div
                className="p-10 text-center text-sm"
                style={{ color: MUTED }}
              >
                No books have been added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead
                    style={{
                      backgroundColor: "#EFE3C4",
                      borderBottom: "1px solid #D8CEB2",
                    }}
                  >
                    <tr>
                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Title
                      </th>

                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Author
                      </th>

                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Category
                      </th>

                      <th
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#7A6A46" }}
                      >
                        Added
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentBooks.map((book) => (
                      <tr
                        key={book.id}
                        className="transition-colors hover:bg-[#FAF7EF]"
                        style={{ borderTop: `1px solid ${BORDER}` }}
                      >
                        <td className="px-6 py-4">
                          <div
                            className="max-w-[280px] truncate font-medium"
                            style={{ color: INK }}
                          >
                            {book.title}
                          </div>

                          <div
                            className="mt-1 text-xs"
                            style={{ color: "#B0B7C4" }}
                          >
                            ISBN: {book.isbn}
                          </div>
                        </td>

                        <td className="px-6 py-4" style={{ color: "#374151" }}>
                          {book.author}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: "#F7F2E7",
                              color: "#5C5240",
                            }}
                          >
                            {book.category.name}
                          </span>
                        </td>

                        <td className="px-6 py-4" style={{ color: "#6B7280" }}>
                          {new Date(book.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Background refresh indicator */}
      {!isLoading && isFetching && !isError && (
        <div
          className="flex items-center justify-end gap-2 text-xs"
          style={{ color: MUTED }}
        >
          <RefreshCw size={12} className="animate-spin" />
          Updating dashboard...
        </div>
      )}
    </div>
  );
}
