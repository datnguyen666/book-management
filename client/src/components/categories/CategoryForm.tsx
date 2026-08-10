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
          Name
        </label>

        <input
          id="category-name"
          type="text"
          {...register("name")}
          placeholder="Enter category name"
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="category-description"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="category-description"
          rows={4}
          {...register("description")}
          placeholder="Enter category description"
          disabled={isSubmitting}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />

        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
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
          className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
          }}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
