import { useState } from "react";
import axios from "axios";
import { FolderOpen, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";

import { CategoryModal } from "@/components/categories/CategoryModal";

import type { Category } from "@/api/category.api";
import type { CreateCategoryFormData } from "@/schemas/category.schema";
import { Edit } from "lucide-react";
import { Trash } from "lucide-react";

type ModalMode = "create" | "edit";

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data: categories = [], isLoading, isError } = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const handleOpenCreate = () => {
    createMutation.reset();
    updateMutation.reset();

    setSelectedCategory(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    createMutation.reset();
    updateMutation.reset();

    setSelectedCategory(category);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (data: CreateCategoryFormData) => {
    createMutation.reset();
    updateMutation.reset();

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
        });
      } else if (selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          data: {
            name: data.name,
            description: data.description || undefined,
          },
        });
      }

      handleCloseModal();
    } catch {
      // Error is displayed through mutation state.
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
    } catch {
      // Error is handled below.
    }
  };

  const getMutationError = () => {
    const error =
      modalMode === "edit" ? updateMutation.error : createMutation.error;

    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Category name already exists.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Category was not found.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "You do not have permission to modify categories.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return "Invalid category data.";
    }

    return modalMode === "edit"
      ? "Failed to update category. Please try again."
      : "Failed to create category. Please try again.";
  };

  const deleteError = deleteMutation.error;

  const getDeleteErrorMessage = () => {
    if (!deleteError) {
      return null;
    }

    if (
      axios.isAxiosError(deleteError) &&
      deleteError.response?.status === 409
    ) {
      return "Cannot delete this category because it is being used by a book.";
    }

    if (
      axios.isAxiosError(deleteError) &&
      deleteError.response?.status === 404
    ) {
      return "Category was not found.";
    }

    if (
      axios.isAxiosError(deleteError) &&
      deleteError.response?.status === 403
    ) {
      return "You do not have permission to delete categories.";
    }

    return "Failed to delete category. Please try again.";
  };

  const modalInitialData = selectedCategory
    ? {
        name: selectedCategory.name,
        description: selectedCategory.description ?? "",
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

          <p className="mt-1 text-sm text-gray-500">Manage book categories.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
          }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getDeleteErrorMessage()}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading categories...
        </div>
      )}

      {/* Load error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load categories.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && categories.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <FolderOpen className="mx-auto text-gray-400" size={40} />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No categories found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Create your first category to get started.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && categories.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    STT
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-center align-middle text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          disabled={deleteMutation.isPending}
                          className="text-xs font-medium text-blue-600 disabled:opacity-50 cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deleteMutation.isPending}
                            className="text-xs font-medium text-red-600 disabled:opacity-50 cursor-pointer"
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
        </div>
      )}

      {/* Create / Edit modal */}
      <CategoryModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={modalInitialData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={getMutationError()}
      />
    </div>
  );
}
