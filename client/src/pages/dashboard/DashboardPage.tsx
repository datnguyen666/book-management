import { useState } from "react";
import { BookOpen, FolderOpen, RefreshCw } from "lucide-react";

import { useDashboardSummary } from "@/hooks/use-dashboard";

interface SummaryCard {
  title: string;
  value: number;
  description: string;
  icon: typeof BookOpen;
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
  ];

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
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

      {/* Summary cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
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
                    className="flex h-11 w-11 items-center justify-center rounded-lg"
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
