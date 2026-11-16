import { X, FolderPlus, FolderEdit, AlertCircle } from "lucide-react";

import { CategoryForm } from "@/components/categories/CategoryForm";
import type { CreateCategoryFormData } from "@/schemas/category.schema";

interface CategoryModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: CreateCategoryFormData;
  onClose: () => void;
  onSubmit: (data: CreateCategoryFormData) => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function CategoryModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: CategoryModalProps) {
  if (!isOpen) {
    return null;
  }

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              {isEdit ? <FolderEdit size={20} /> : <FolderPlus size={20} />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
              </h2>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? "Cập nhật thông tin chi tiết của danh mục thể loại sách."
                  : "Tạo danh mục mới để phân loại đầu sách trong thư viện."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <CategoryForm
            key={`${mode}-${initialData?.name ?? ""}`}
            initialData={initialData}
            submitLabel={isEdit ? "Lưu thay đổi" : "Tạo thể loại"}
            submittingLabel={isEdit ? "Đang lưu..." : "Đang tạo..."}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
