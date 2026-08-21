import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useBook } from "@/hooks/use-books";
import { getMediaUrl } from "@/lib/media";

export function BookDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const bookId = Number(id);

  const { data: book, isLoading, isError } = useBook(bookId);

  const handleBack = () => {
    navigate("/books");
  };

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Books
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Invalid book ID.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Books
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading book...
        </div>
      </div>
    );
  }

  if (isError || !book) {
    let message = "Failed to load book. Please try again.";

    if (isError || !book) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Books
          </button>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Failed to load book. Please try again.
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Books
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Books
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Book Details</h1>

          <p className="mt-1 text-sm text-gray-500">
            View detailed information about this book.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Cover */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-gray-100">
            {book.coverImage ? (
              <img
                src={getMediaUrl(book.coverImage)}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <BookOpen size={48} />
                <span className="text-xs">No cover image</span>
              </div>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {book.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">Book ID: #{book.id}</p>
          </div>

          <div className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2">
            {/* ISBN */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                ISBN
              </p>

              <p className="mt-1 text-sm text-gray-900">{book.isbn}</p>
            </div>

            {/* Author */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Author
              </p>

              <p className="mt-1 text-sm text-gray-900">{book.author}</p>
            </div>

            {/* Publisher */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Publisher
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {book.publisher || "—"}
              </p>
            </div>

            {/* Published Date */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Published Date
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {book.publishedDate
                  ? new Date(book.publishedDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Category
              </p>

              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                {book.category?.name}
              </span>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Price
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {Number(book.price).toFixed(2)}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Quantity
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  book.quantity === 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {book.quantity}
              </p>
            </div>

            {/* Created */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Created At
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {new Date(book.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="border-t px-6 py-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {book.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
