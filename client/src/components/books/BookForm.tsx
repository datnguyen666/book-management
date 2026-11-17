import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  UploadCloud,
  X,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import type { Book, CreateBookPayload } from "@/api/book.api";
import type { Category } from "@/api/category.api";
import { getMediaUrl } from "@/lib/media";

const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đầu sách")
    .max(255, "Tên đầu sách không được vượt quá 255 ký tự"),

  isbn: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã ISBN")
    .max(50, "Mã ISBN không được vượt quá 50 ký tự"),

  author: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên tác giả")
    .max(255, "Tên tác giả không được vượt quá 255 ký tự"),

  publisher: z.string().trim().optional().or(z.literal("")),

  publishedDate: z.string().optional().or(z.literal("")),

  description: z.string().trim().optional().or(z.literal("")),

  price: z
    .number({ message: "Đơn giá phải là số hợp lệ" })
    .min(0, "Đơn giá không được nhỏ hơn 0"),

  quantity: z
    .number({ message: "Số lượng bản phải là số nguyên" })
    .int("Số lượng bản phải là số nguyên")
    .min(0, "Số lượng bản không được nhỏ hơn 0"),

  categoryId: z
    .number({ message: "Vui lòng chọn thể loại sách" })
    .int()
    .positive("Vui lòng chọn thể loại sách"),
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
    setValue,
    control,
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
      quantity: 0,
      categoryId: 0,
    },
  });

  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    book?.coverImage ?? null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [prevKey, setPrevKey] = useState(`${mode}-${book?.id ?? "new"}`);
  const currentKey = `${mode}-${book?.id ?? "new"}`;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setCoverFile(null);
    setCoverPreview(mode === "edit" ? (book?.coverImage ?? null) : null);
    setImageError(null);
  }

  const publishedDateValue = useWatch({ control, name: "publishedDate" });

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
        quantity: book.quantity,
        categoryId: book.categoryId,
      });
    } else if (mode === "create") {
      reset({
        title: "",
        isbn: "",
        author: "",
        publisher: "",
        publishedDate: "",
        description: "",
        price: 0,
        quantity: 1,
        categoryId: 0,
      });
    }
  }, [mode, book, reset]);

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/jfif",
  ];
  const ALLOWED_EXT = /\.(jpg|jpeg|png|webp|jfif)$/i;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const processSelectedFile = (file: File) => {
    setImageError(null);

    const isValidType =
      ALLOWED_TYPES.includes(file.type) && ALLOWED_EXT.test(file.name);

    if (!isValidType) {
      setImageError(
        "Định dạng không được hỗ trợ. Chỉ chấp nhận các file ảnh: JPG, PNG, WEBP, JFIF."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError(
        "Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 5MB). Vui lòng nén hoặc chọn ảnh nhỏ hơn."
      );
      return;
    }

    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    event.target.value = "";
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setImageError(null);
  };

  const handleResetToOriginal = () => {
    setCoverFile(null);
    setCoverPreview(book?.coverImage ?? null);
    setImageError(null);
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
        quantity: data.quantity,
        categoryId: data.categoryId,
      },
      coverFile ?? undefined
    );
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* 1. Tên Đầu Sách */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Tên đầu sách <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          disabled={isSubmitting}
          placeholder="Nhập tựa đề đầy đủ của cuốn sách..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
        />
        {errors.title && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 2. Mã ISBN & Tác Giả */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mã chuẩn ISBN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("isbn")}
            disabled={mode === "edit" || isSubmitting}
            placeholder="Ví dụ: 978-0132350884"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-100 disabled:text-gray-500"
          />
          {errors.isbn && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.isbn.message}
            </p>
          )}
          {mode === "edit" && (
            <p className="mt-1 text-[11px] text-gray-400">
              Mã ISBN là định danh duy nhất không thể chỉnh sửa.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Tác giả <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("author")}
            disabled={isSubmitting}
            placeholder="Ví dụ: Robert C. Martin"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
          {errors.author && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.author.message}
            </p>
          )}
        </div>
      </div>

      {/* 3. Thể Loại & Nhà Xuất Bản */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Thể loại sách <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoryId", {
              valueAsNumber: true,
            })}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value={0}>-- Chọn thể loại sách --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nhà xuất bản <span className="text-xs font-normal text-gray-400">(Tùy chọn)</span>
          </label>
          <input
            type="text"
            {...register("publisher")}
            disabled={isSubmitting}
            placeholder="Ví dụ: NXB Trẻ, NXB Thông Tin..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      {/* 4. Ngày Xuất Bản, Đơn Giá Bìa & Số Lượng Bản Nhập */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Ngày xuất bản: Vừa gõ được vừa bấm lịch */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ngày xuất bản <span className="text-xs font-normal text-gray-400">(Tùy chọn)</span>
          </label>
          <div className="relative">
            <input
              type="date"
              {...register("publishedDate")}
              ref={(el) => {
                register("publishedDate").ref(el);
                dateInputRef.current = el;
              }}
              onClick={(e) => {
                try {
                  (e.target as HTMLInputElement).showPicker?.();
                } catch {
                  // Fallback nếu browser không hỗ trợ
                }
              }}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-14 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {publishedDateValue && (
                <button
                  type="button"
                  onClick={() => setValue("publishedDate", "")}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-lg p-1 text-gray-400 hover:text-gray-600 transition"
                  title="Xóa ngày đã chọn"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.();
                  } catch {
                    dateInputRef.current?.focus();
                  }
                }}
                disabled={isSubmitting}
                className="cursor-pointer rounded-lg p-1 text-gray-400 hover:text-amber-600 transition"
                title="Bấm để mở lịch chọn ngày"
              >
                <Calendar size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Đơn giá bìa */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Đơn giá bìa (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="1000"
            min="0"
            {...register("price", {
              valueAsNumber: true,
            })}
            disabled={isSubmitting}
            placeholder="0"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
          {errors.price && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* Số lượng bản */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Tổng số bản nhập <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            {...register("quantity", {
              valueAsNumber: true,
            })}
            disabled={isSubmitting}
            placeholder="1"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
          {errors.quantity && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      {/* 5. Ảnh Bìa Sách (Drag & Drop Zone + Preview) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Ảnh bìa sách <span className="text-xs font-normal text-gray-400">(Tùy chọn)</span>
        </label>

        {/* Input file ẩn phục vụ click chọn file */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/jpg,image/jfif,image/webp"
          onChange={handleFileInputChange}
          disabled={isSubmitting}
          className="hidden"
        />

        {coverPreview ? (
          /* Preview Mode khi đã có ảnh */
          <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <img
                src={
                  coverPreview.startsWith("blob:")
                    ? coverPreview
                    : getMediaUrl(coverPreview)
                }
                alt="Xem trước ảnh bìa sách"
                className="h-full w-full object-cover"
              />
              {coverFile && (
                <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-xs">
                  Mới
                </span>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-xs font-semibold text-gray-900">
                  {coverFile
                    ? `Đã chọn ảnh: ${coverFile.name}`
                    : "Ảnh bìa hiện tại của đầu sách"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {coverFile
                  ? `Dung lượng: ${(coverFile.size / 1024).toFixed(1)} KB`
                  : "Bạn có thể tải ảnh mới lên để thay thế hoặc xóa ảnh bìa."}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ImageIcon size={13} />
                  <span>Chọn ảnh khác</span>
                </button>

                {mode === "edit" && coverFile && book?.coverImage && (
                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    disabled={isSubmitting}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    <RotateCcw size={13} />
                    <span>Khôi phục ảnh gốc</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={isSubmitting}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-2xs transition hover:bg-red-50 disabled:opacity-50"
                >
                  <X size={13} />
                  <span>Xóa ảnh</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dropzone khi chưa có ảnh */
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
                : "border-gray-200 bg-gray-50/40 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                isDragging
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <UploadCloud size={24} />
            </div>

            <p className="mt-3 text-xs font-semibold text-gray-900">
              {isDragging
                ? "Thả file ảnh vào đây để tải lên"
                : "Kéo & thả ảnh bìa vào đây, hoặc click để chọn tệp"}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Định dạng hỗ trợ: JPG, PNG, WEBP, JFIF (Dung lượng tối đa 5MB)
            </p>
          </div>
        )}

        {/* Thông báo lỗi khi chọn ảnh */}
        {imageError && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span>{imageError}</span>
          </div>
        )}
      </div>

      {/* 6. Trích Yếu & Tóm Tắt Nội Dung */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Giới thiệu & Tóm tắt nội dung <span className="text-xs font-normal text-gray-400">(Tùy chọn)</span>
        </label>
        <textarea
          rows={4}
          {...register("description")}
          disabled={isSubmitting}
          placeholder="Nhập phần tóm tắt nội dung hoặc thông tin giới thiệu về tác phẩm..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 7. Nút Hành Động Chân Form */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy bỏ
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-amber-400 shadow-2xs transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Đang lưu..."
            : mode === "create"
            ? "Thêm đầu sách"
            : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
