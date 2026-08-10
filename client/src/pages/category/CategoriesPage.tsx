import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import axios from "axios";

import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { CategoryModal } from "@/components/categories/CategoryModal";
import type { CreateCategoryFormData } from "@/schemas/category.schema";

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories = [], isLoading, isError } = useCategories();

  const createCategoryMutation = useCreateCategory();

  const handleCreateCategory = async (data: CreateCategoryFormData) => {
    createCategoryMutation.reset();

    try {
      await createCategoryMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });

      setIsModalOpen(false);
    } catch {
      // Error is handled by mutation state.
    }
  };

  const getErrorMessage = () => {
    const error = createCategoryMutation.error;

    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Category name already exists.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return "Invalid category data.";
    }

    return "Failed to create category. Please try again.";
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

          <p className="mt-1 text-sm text-gray-500">Manage book categories.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            createCategoryMutation.reset();
            setIsModalOpen(true);
          }}
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

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading categories...
        </div>
      )}

      {/* Error */}
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

      {/* Category table */}
      {!isLoading && !isError && categories.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">ID</th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-500">{category.id}</td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!createCategoryMutation.isPending) {
            setIsModalOpen(false);
          }
        }}
        onSubmit={handleCreateCategory}
        isSubmitting={createCategoryMutation.isPending}
        errorMessage={getErrorMessage()}
      />
    </div>
  );
}
