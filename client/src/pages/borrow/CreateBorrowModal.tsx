import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { CreateBorrowRequest } from "@/api/borrow.api";
import { useBooks } from "@/hooks/use-books";

interface CreateBorrowModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBorrowRequest) => Promise<void>;
}

export function CreateBorrowModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateBorrowModalProps) {
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerCode, setBorrowerCode] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading: isBooksLoading } = useBooks({
    page: 1,
    limit: 100,
  });

  const books = data?.data ?? [];

  const availableBooks = useMemo(() => {
    return books.filter((book) => book.quantity - book.borrowedQuantity > 0);
  }, [books]);

  useEffect(() => {
    if (!isOpen) {
      setBorrowerName("");
      setBorrowerCode("");
      setBookId("");
      setDueDate("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!borrowerName.trim()) {
      setError("Borrower name is required.");
      return;
    }

    if (!borrowerCode.trim()) {
      setError("Borrower code is required.");
      return;
    }

    if (!bookId) {
      setError("Please select a book.");
      return;
    }

    if (!dueDate) {
      setError("Due date is required.");
      return;
    }

    const selectedDate = new Date(dueDate);

    if (selectedDate <= new Date()) {
      setError("Due date must be later than the current date.");
      return;
    }

    try {
      await onSubmit({
        borrowerName: borrowerName.trim(),
        borrowerCode: borrowerCode.trim(),
        bookId: Number(bookId),
        dueDate,
      });
    } catch {
      // Error đã được xử lý ở BorrowPage
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Borrow
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Create a new book borrowing record.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Book */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Book
            </label>

            <select
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              disabled={isBooksLoading || isSubmitting}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
            >
              <option value="">
                {isBooksLoading ? "Loading books..." : "Select a book"}
              </option>

              {availableBooks.map((book) => {
                const available = book.quantity - book.borrowedQuantity;

                return (
                  <option key={book.id} value={book.id}>
                    {book.title} — Available: {available}
                  </option>
                );
              })}
            </select>

            {!isBooksLoading && availableBooks.length === 0 && (
              <p className="mt-1.5 text-xs text-red-500">
                No books are currently available for borrowing.
              </p>
            )}
          </div>

          {/* Borrower Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Borrower Name
            </label>

            <input
              type="text"
              value={borrowerName}
              onChange={(event) => setBorrowerName(event.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Nguyễn Văn A"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
            />
          </div>

          {/* Borrower Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Borrower Code
            </label>

            <input
              type="text"
              value={borrowerCode}
              onChange={(event) => setBorrowerCode(event.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. NV001"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={isSubmitting}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 disabled:bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || isBooksLoading || availableBooks.length === 0
              }
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Creating..." : "Create Borrow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
