import { BookOpen, RotateCcw } from "lucide-react";
import type { BorrowRecord } from "@/api/borrow.api";
import { useBorrows, useReturnBorrow } from "@/hooks/use-borrow";

export function BorrowPage() {
  const { data: borrows = [], isLoading, isError, isFetching } = useBorrows();

  const returnMutation = useReturnBorrow();

  const handleReturn = async (borrow: BorrowRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to return "${borrow.book.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    await returnMutation.mutateAsync(borrow.id);
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
            There are no borrow records to display.
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

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Borrowed At
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Due Date
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Returned At
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Processed By
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {borrows.map((borrow, index) => (
                  <tr
                    key={borrow.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* STT */}
                    <td className="px-6 py-4 text-center align-middle text-gray-500">
                      {index + 1}
                    </td>

                    {/* Book */}
                    <td className="max-w-[220px] px-6 py-4">
                      <div className="truncate font-medium text-gray-900 whitespace-nowrap">
                        {borrow.book.title}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        ISBN: {borrow.book.isbn}
                      </div>
                    </td>

                    {/* Borrower */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {borrow.borrowerName}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {borrow.borrowerCode}
                      </div>
                    </td>

                    {/* Borrowed At */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(borrow.borrowedAt).toLocaleDateString()}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(borrow.dueDate).toLocaleDateString()}
                    </td>

                    {/* Returned At */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {borrow.returnedAt
                        ? new Date(borrow.returnedAt).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      {borrow.status === "BORROWING" ? (
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
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">
                        {borrow.processedBy.fullName}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {borrow.processedBy.username}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      {borrow.status === "BORROWING" ? (
                        <button
                          type="button"
                          disabled={returnMutation.isPending}
                          onClick={() => handleReturn(borrow)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw size={16} />
                          Return
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
