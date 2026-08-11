import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Book, CreateBookPayload } from "@/api/book.api";
import type { Category } from "@/api/category.api";
import { getMediaUrl } from "@/lib/media";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),

  isbn: z.string().min(1, "ISBN is required").max(50, "ISBN is too long"),

  author: z
    .string()
    .min(1, "Author is required")
    .max(255, "Author is too long"),

  publisher: z.string().optional(),

  publishedDate: z.string().optional(),

  description: z.string().optional(),

  price: z.number().min(0, "Price must be 0 or greater"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock must be 0 or greater"),

  categoryId: z.number().int().positive("Category is required"),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookFormProps {
  mode: "create" | "edit";
  book?: Book;
  categories: Category[];
  isSubmitting?: boolean;
  onSubmit: (data: CreateBookPayload, coverFile?: File) => Promise<void>;
  onCancel: () => void;
}

export function BookForm({
  mode,
  book,
  categories,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      isbn: "",
      author: "",
      publisher: "",
      publishedDate: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: 0,
    },
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    book?.coverImage ?? null,
  );

  useEffect(() => {
    if (mode === "edit" && book) {
      reset({
        title: book.title,
        isbn: book.isbn,
        author: book.author,
        publisher: book.publisher ?? "",
        publishedDate: book.publishedDate
          ? book.publishedDate.slice(0, 10)
          : "",
        description: book.description ?? "",
        price: Number(book.price),
        stock: book.stock,
        categoryId: book.categoryId,
      });

      setCoverFile(null);
      setCoverPreview(book.coverImage ?? null);
    }

    if (mode === "create") {
      reset({
        title: "",
        isbn: "",
        author: "",
        publisher: "",
        publishedDate: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId: 0,
      });

      setCoverFile(null);
      setCoverPreview(null);
    }
  }, [mode, book, reset]);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCoverFile(file);

    const previewUrl = URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  const submit = async (data: BookFormValues) => {
    await onSubmit(
      {
        title: data.title.trim(),
        isbn: data.isbn.trim(),
        author: data.author.trim(),
        publisher: data.publisher?.trim() || undefined,
        publishedDate: data.publishedDate || undefined,
        description: data.description?.trim() || undefined,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
      },
      coverFile ?? undefined,
    );
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Title
        </label>

        <input
          {...register("title")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />

        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* ISBN */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ISBN
        </label>

        <input
          {...register("isbn")}
          disabled={mode === "edit"}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none disabled:bg-gray-100"
        />

        {errors.isbn && (
          <p className="mt-1 text-xs text-red-600">{errors.isbn.message}</p>
        )}
      </div>

      {/* Author */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Author
        </label>

        <input
          {...register("author")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />

        {errors.author && (
          <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>
        )}
      </div>

      {/* Publisher */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Publisher
        </label>

        <input
          {...register("publisher")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
      </div>

      {/* Published Date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Published Date
        </label>

        <input
          type="date"
          {...register("publishedDate")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>

        <select
          {...register("categoryId", {
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
        >
          <option value={0}>Select category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Price + Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            {...register("price", {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />

          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stock
          </label>

          <input
            type="number"
            min="0"
            step="1"
            {...register("stock", {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />

          {errors.stock && (
            <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Cover Image
        </label>

        <div className="space-y-3">
          {coverPreview && (
            <div className="flex h-48 w-36 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100">
              <img
                src={
                  coverPreview.startsWith("blob:")
                    ? coverPreview
                    : getMediaUrl(coverPreview)
                }
                alt="Book cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />

          <p className="text-xs text-gray-400">JPG, PNG or WebP.</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          rows={5}
          {...register("description")}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />

        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Book"
              : "Update Book"}
        </button>
      </div>
    </form>
  );
}
