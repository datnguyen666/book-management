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
      title: "Total Books",
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

  const monthlyData = data?.monthlyAcquisitions?.data ?? [];

  const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count), 1);

  const categoryData = data?.categoryBreakdown ?? [];

  const maxCategoryCount = Math.max(
    ...categoryData.map((item) => item.count),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your library.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

                    <div className="mt-3 h-10 w-20 animate-pulse rounded bg-gray-200" />

                    <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
                  </div>

                  <div className="h-11 w-11 animate-pulse rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Analytics loading */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white" />

            <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white" />
          </div>

          {/* Recent books loading */}
          <div className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white" />
        </>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            Failed to load dashboard data.
          </p>

          <p className="mt-1 text-xs text-red-500">
            Please check the server connection and try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="mt-4 rounded-md border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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

              return (
                <div
                  key={card.title}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="pr-12">
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <p className="mt-2 text-4xl font-bold text-gray-900">
                        {card.value}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: "#111827",
                        color: "#d4a853",
                      }}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Books Added per Month */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Books Added per Month
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Books added during {data.monthlyAcquisitions.year}
                  </p>
                </div>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "#111827",
                    color: "#d4a853",
                  }}
                >
                  <BookOpen size={18} />
                </div>
              </div>

              <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3">
                {monthlyData.map((item) => {
                  const height =
                    item.count === 0
                      ? 4
                      : Math.max((item.count / maxMonthlyCount) * 100, 8);

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[10px] font-medium text-gray-500">
                        {item.count}
                      </span>

                      <div className="flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-md transition-all duration-300"
                          style={{
                            height: `${height}%`,
                            backgroundColor: "#111827",
                            minHeight: "4px",
                          }}
                        />
                      </div>

                      <span className="text-[10px] text-gray-400">
                        {MONTH_LABELS[item.month - 1] ?? item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown By Category */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Breakdown By Category
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Number of books in each category
                  </p>
                </div>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "#111827",
                    color: "#d4a853",
                  }}
                >
                  <FolderOpen size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {categoryData.length === 0 && (
                  <p className="py-10 text-center text-sm text-gray-400">
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
                        <span className="truncate text-sm font-medium text-gray-700">
                          {category.categoryName}
                        </span>

                        <span className="shrink-0 text-xs font-semibold text-gray-500">
                          {category.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: "#111827",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently Added Books */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Recently Added Books
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  The latest books added to the library
                </p>
              </div>

              <CalendarDays size={20} className="text-gray-400" />
            </div>

            {data.recentBooks.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                No books have been added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Title
                      </th>

                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Author
                      </th>

                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Category
                      </th>

                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Added
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {data.recentBooks.map((book) => (
                      <tr
                        key={book.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-[280px] truncate font-medium text-gray-900">
                            {book.title}
                          </div>

                          <div className="mt-1 text-xs text-gray-400">
                            ISBN: {book.isbn}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {book.author}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {book.category.name}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
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
        <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
          <RefreshCw size={12} className="animate-spin" />
          Updating dashboard...
        </div>
      )}
    </div>
  );
}
