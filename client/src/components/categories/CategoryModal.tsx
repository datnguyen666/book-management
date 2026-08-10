import { X } from "lucide-react";

import { CategoryForm } from "@/components/categories/CategoryForm";
import type { CreateCategoryFormData } from "@/schemas/category.schema";

interface CategoryModalProps {
  isOpen: boolean;

  onClose: () => void;

  onSubmit: (data: CreateCategoryFormData) => void;

  isSubmitting: boolean;

  errorMessage?: string | null;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: CategoryModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add Category
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Create a new book category.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mx-6 mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <CategoryForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
