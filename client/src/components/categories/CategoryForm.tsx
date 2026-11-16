import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCategorySchema,
  type CreateCategoryFormData,
} from "@/schemas/category.schema";

interface CategoryFormProps {
  initialData?: CreateCategoryFormData;
  onSubmit: (data: CreateCategoryFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="category-name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Tên thể loại <span className="text-red-500">*</span>
        </label>

        <input
          id="category-name"
          type="text"
          {...register("name")}
          placeholder="Ví dụ: Khoa học công nghệ, Kinh tế & Quản trị..."
          disabled={isSubmitting}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
        />

        {errors.name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="category-description"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Mô tả thể loại <span className="text-xs font-normal text-gray-400">(Tùy chọn)</span>
        </label>

        <textarea
          id="category-description"
          rows={4}
          {...register("description")}
          placeholder="Nhập ghi chú hoặc mô tả tóm tắt về thể loại sách này..."
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
        />

        {errors.description && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Actions */}
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
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
