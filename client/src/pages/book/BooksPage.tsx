import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { BookOpen, ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage books in the library.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
          }}
          onClick={handleCreate}
          disabled={isCategoriesLoading || isCategoriesError}
        >
          <Plus size={16} />
          Add Book
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading books...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load books. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-gray-400" size={40} />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No books found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            There are no books to display.
          </p>
        </div>
      )}

      {/* Book Table */}
      {!isLoading && !isError && books.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    STT
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Title
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    ISBN
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Author
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Price
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {books.map((book, index) => (
                  <tr
                    key={book.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* ID */}
                    <td className="px-6 py-4 text-center align-middle text-gray-500">
                      {index + 1}
                    </td>

                    {/* Title */}
                    <td className="max-w-[220px] px-6 py-4">
                      <div className="truncate font-medium text-gray-900">
                        {book.title}
                      </div>
                    </td>

                    {/* ISBN */}
                    <td className="px-6 py-4 text-gray-500">{book.isbn}</td>

                    {/* Author */}
                    <td className="px-6 py-4 text-gray-700">{book.author}</td>

                    {/* Category */}
                    <td className="px-6 py-4 text-center align-middle">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {book.category.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-center align-middle text-gray-900">
                      {Number(book.price).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-center align-middle text-gray-500">
                      <span
                        className={
                          book.stock === 0
                            ? "font-semibold text-red-600"
                            : "text-gray-700"
                        }
                      >
                        {book.stock}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/books/${book.id}`)}
                          className="text-xs font-medium text-blue-600 cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="text-xs font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleEdit(book)}
                        >
                          <Edit size={16} />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 cursor-pointer disabled:opacity-50"
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
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t bg-white px-6 py-4">
            <p className="text-xs text-gray-500">
              {pagination
                ? `Showing page ${pagination.page} of ${pagination.totalPages} (${pagination.total} books)`
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {formMode === "create" ? "Create Book" : "Update Book"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
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
