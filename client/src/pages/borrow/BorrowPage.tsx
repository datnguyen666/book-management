import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ChevronDown,
  Search,
} from "lucide-react";

import type { BorrowRecord, BorrowStatus } from "@/api/borrow.api";

import { useBorrows, useReturnBorrow } from "@/hooks/use-borrow";

const DEFAULT_LIMIT = 10;

export function BorrowPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BorrowStatus | "">("");

  const { data, isLoading, isError, isFetching } = useBorrows({
    page,
    limit: DEFAULT_LIMIT,
    search,
    status,
  });

  const returnMutation = useReturnBorrow();

  const borrows = data?.data ?? [];

  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  const handleReturn = async (borrow: BorrowRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to return "${borrow.book.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await returnMutation.mutateAsync(borrow.id);
    } catch (error) {
      console.error("Failed to return book:", error);

      window.alert("Failed to return the book. Please try again.");
    }
  };

  const handlePrevious = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNext = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Borrow Records</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage book borrowing and return records.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search borrower, code, book or ISBN..."
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BorrowStatus | "");
              setPage(1);
            }}
            className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600 sm:w-44"
          >
            <option value="">All Status</option>
            <option value="BORROWING">Borrowing</option>
            <option value="RETURNED">Returned</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading borrow records...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load borrow records. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && borrows.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-gray-400" size={40} />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No borrow records found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {search || status
              ? "Try adjusting your search or filter."
              : "There are no borrow records to display."}
          </p>
        </div>
      )}

      {/* Borrow Table */}
      {!isLoading && !isError && borrows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    STT
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Book
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Borrower
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    Borrowed At
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    Due Date
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    Returned At
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    Processed By
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {borrows.map((borrow, index) => {
                  const isBorrowing = borrow.status === "BORROWING";

                  const isReturning =
                    returnMutation.isPending &&
                    returnMutation.variables === borrow.id;

                  const isOverdue =
                    isBorrowing && new Date(borrow.dueDate) < new Date();

                  return (
                    <tr
                      key={borrow.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* STT */}
                      <td className="px-6 py-4 text-center align-middle text-gray-500">
                        {(page - 1) * DEFAULT_LIMIT + index + 1}
                      </td>

                      {/* Book */}
                      <td className="max-w-[220px] px-6 py-4">
                        <div className="truncate font-medium text-gray-900 whitespace-nowrap">
                          {borrow.book.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-400 whitespace-nowrap">
                          ISBN: {borrow.book.isbn}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {borrow.borrowerName}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {borrow.borrowerCode}
                        </div>
                      </td>

                      {/* Borrowed At */}
                      <td className="px-6 py-4 text-center whitespace-nowrap text-gray-700">
                        {new Date(borrow.borrowedAt).toLocaleDateString()}
                      </td>

                      {/* Due Date */}
                      <td
                        className={`px-6 py-4 text-center whitespace-nowrap ${
                          isOverdue
                            ? "font-semibold text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {new Date(borrow.dueDate).toLocaleDateString()}

                        {isOverdue && (
                          <div className="mt-1 text-xs text-red-500">
                            Overdue
                          </div>
                        )}
                      </td>

                      {/* Returned At */}
                      <td className="px-6 py-4 text-center whitespace-nowrap text-gray-700">
                        {borrow.returnedAt
                          ? new Date(borrow.returnedAt).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {isBorrowing ? (
                          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                            Borrowing
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Returned
                          </span>
                        )}
                      </td>

                      {/* Processed By */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-700">
                          {borrow.processedBy.fullName ||
                            borrow.processedBy.username}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {borrow.processedBy.username}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        {isBorrowing ? (
                          <button
                            type="button"
                            disabled={returnMutation.isPending}
                            onClick={() => handleReturn(borrow)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <RotateCcw
                              size={16}
                              className={isReturning ? "animate-spin" : ""}
                            />

                            {isReturning ? "Returning..." : "Return"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t bg-white px-6 py-4">
            <p className="text-xs text-gray-500">
              {pagination
                ? `Showing page ${pagination.page} of ${pagination.totalPages} (${pagination.total} records)`
                : "Loading..."}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={page === 1 || isFetching}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={isFetching}
                    className={`min-w-8 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                      pageNumber === page
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages || isFetching}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background fetching indicator */}
      {isFetching && !isLoading && (
        <p className="text-right text-xs text-gray-400">Updating...</p>
      )}
    </div>
  );
}
