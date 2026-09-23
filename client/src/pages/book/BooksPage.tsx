import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
} from "lucide-react";

import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useUploadBookCover,
  useDeleteBook,
} from "@/hooks/use-books";
import { useNavigate } from "react-router-dom";
import type { Book, CreateBookPayload } from "@/api/book.api";
import { BookForm } from "@/components/books/BookForm";
import { useCategories } from "@/hooks/use-categories";
import { Eye } from "lucide-react";
import { Edit } from "lucide-react";
import { Trash } from "lucide-react";

const DEFAULT_LIMIT = 10;

export function BooksPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  const { data, isLoading, isError, isFetching } = useBooks({
    page,
    limit: DEFAULT_LIMIT,
  });

  const books = data?.data ?? [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

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

  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === "ADMIN";

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
    data: CreateBookPayload,
    coverFile?: File,
  ) => {
    if (formMode === "create") {
      const createdBook = await createMutation.mutateAsync(data);

      if (coverFile) {
        await uploadCoverMutation.mutateAsync({
          id: createdBook.id,
          file: coverFile,
        });
      }
    } else if (selectedBook) {
      await updateMutation.mutateAsync({
        id: selectedBook.id,
        payload: data,
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "'Source Serif 4', serif", color: "#12192B" }}
          >
            Books
          </h1>

          <p className="mt-1 text-sm" style={{ color: "#8A93A6" }}>
            Manage books in the library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition hover:bg-[#F7F2E7] cursor-pointer"
            style={{ border: "1px solid #E6DFCE", color: "#12192B" }}
            onClick={() => navigate("/assets")}
          >
            <Wallet size={16} />
            View Assets
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: "#12192B",
              color: "#C89B3C",
            }}
            onClick={handleCreate}
            disabled={isCategoriesLoading || isCategoriesError}
          >
            <Plus size={16} />
            Add Book
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          className="rounded-lg bg-white p-8 text-center text-sm"
          style={{ border: "1px solid #E6DFCE", color: "#8A93A6" }}
        >
          Loading books...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-lg p-6 text-sm"
          style={{
            border: "1px solid #A6432C33",
            backgroundColor: "#FBEFEC",
            color: "#A6432C",
          }}
        >
          Failed to load books. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && books.length === 0 && (
        <div
          className="rounded-lg bg-white p-10 text-center"
          style={{ border: "1px solid #E6DFCE" }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ border: "1px solid #B8863B55" }}
          >
            <BookOpen size={20} style={{ color: "#B8863B" }} />
          </div>

          <p className="mt-3 text-sm font-medium" style={{ color: "#12192B" }}>
            No books found
          </p>

          <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
            There are no books to display.
          </p>
        </div>
      )}

      {/* Book Table */}
      {!isLoading && !isError && books.length > 0 && (
        <div
          className="overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(18,25,43,0.06),0_8px_24px_-12px_rgba(18,25,43,0.14)]"
          style={{ border: "1px solid #D8CEB2" }}
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead
                style={{
                  backgroundColor: "#EFE3C4",
                  borderBottom: "1px solid #D8CEB2",
                }}
              >
                <tr>
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    STT
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Title
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    ISBN
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Author
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Category
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Price
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Quantity
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Borrowed
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Available
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {books.map((book, index) => {
                  const available = book.quantity - book.borrowedQuantity;

                  return (
                    <tr
                      key={book.id}
                      className="transition-colors hover:bg-[#FAF7EF]"
                      style={{ borderTop: "1px solid #E6DFCE" }}
                    >
                      {/* ID */}
                      <td
                        className="px-6 py-4 text-center align-middle tabular-nums"
                        style={{ color: "#B0B7C4" }}
                      >
                        {(page - 1) * DEFAULT_LIMIT + index + 1}
                      </td>

                      {/* Title */}
                      <td className="max-w-[220px] px-6 py-4">
                        <div
                          className="truncate font-medium whitespace-nowrap"
                          style={{ color: "#12192B" }}
                        >
                          {book.title}
                        </div>
                      </td>

                      {/* ISBN */}
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: "#6B7280" }}
                      >
                        {book.isbn}
                      </td>

                      {/* Author */}
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: "#374151" }}
                      >
                        {book.author}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-center align-middle">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: "#F7F2E7",
                            color: "#5C5240",
                          }}
                        >
                          {book.category.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td
                        className="px-6 py-4 text-center align-middle tabular-nums"
                        style={{ color: "#12192B" }}
                      >
                        {Number(book.price).toFixed(2)}
                      </td>

                      {/* Quantity */}
                      <td
                        className="px-6 py-4 text-center align-middle tabular-nums"
                        style={{ color: "#8A93A6" }}
                      >
                        {book.quantity}
                      </td>

                      <td
                        className="px-6 py-4 text-center align-middle tabular-nums"
                        style={{ color: "#8A93A6" }}
                      >
                        {book.borrowedQuantity}
                      </td>

                      <td
                        className="px-6 py-4 text-center align-middle font-semibold tabular-nums"
                        style={{
                          color: available === 0 ? "#A6432C" : "#8A93A6",
                        }}
                      >
                        {available}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/books/${book.id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F7F2E7] cursor-pointer"
                            style={{
                              border: "1px solid #E6DFCE",
                              color: "#5C6B85",
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F7F2E7] cursor-pointer"
                            style={{
                              border: "1px solid #B8863B55",
                              color: "#B8863B",
                            }}
                            onClick={() => handleEdit(book)}
                          >
                            <Edit size={14} />
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#FBEFEC] cursor-pointer disabled:opacity-50"
                              style={{
                                border: "1px solid #A6432C55",
                                color: "#A6432C",
                              }}
                              disabled={deleteMutation.isPending}
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  `Are you sure you want to delete "${book.title}"?`,
                                );

                                if (!confirmed) {
                                  return;
                                }

                                await deleteMutation.mutateAsync(book.id);
                                if (books.length === 1 && page > 1) {
                                  setPage((current) => current - 1);
                                }
                              }}
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between bg-white px-6 py-4"
            style={{ borderTop: "1px solid #E6DFCE" }}
          >
            <p className="text-xs" style={{ color: "#8A93A6" }}>
              {pagination
                ? `Showing page ${pagination.page} of ${pagination.totalPages} (${pagination.total} books)`
                : "Loading..."}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={page === 1 || isFetching}
                className="rounded-md p-2 transition hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ border: "1px solid #E6DFCE", color: "#5C6B85" }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => {
                  const isActive = pageNumber === page;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isFetching}
                      className="min-w-8 rounded-md px-2 py-1.5 text-xs font-medium tabular-nums transition"
                      style={{
                        backgroundColor: isActive ? "#12192B" : "transparent",
                        color: isActive ? "#C89B3C" : "#5C6B85",
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                },
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages || isFetching}
                className="rounded-md p-2 transition hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ border: "1px solid #E6DFCE", color: "#5C6B85" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background fetching indicator */}
      {isFetching && !isLoading && (
        <p className="text-right text-xs" style={{ color: "#B0B7C4" }}>
          Updating...
        </p>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            style={{ border: "1px solid #E6DFCE" }}
          >
            <div
              className="mb-6"
              style={{ borderBottom: "1px solid #E6DFCE", paddingBottom: 16 }}
            >
              <h2
                className="text-xl font-semibold"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  color: "#12192B",
                }}
              >
                {formMode === "create" ? "Create Book" : "Update Book"}
              </h2>

              <p className="mt-1 text-sm" style={{ color: "#8A93A6" }}>
                {formMode === "create"
                  ? "Create a new book."
                  : "Update book information."}
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
    </div>
  );
}
