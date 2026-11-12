import { useState } from "react";
import axios from "axios";
import { FolderOpen, Plus, Search, X, RotateCcw } from "lucide-react";
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

const INK = "#12192B";
const BRASS = "#B8863B";
const BORDER = "#E6DFCE";
const MUTED = "#8A93A6";
const OVERDUE = "#A6432C";

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading, isError } = useCategories();

  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = categories.filter((cat) => {
    if (!query) return true;
    const matchName = cat.name.toLowerCase().includes(query);
    const matchDesc = cat.description ? cat.description.toLowerCase().includes(query) : false;
    return matchName || matchDesc;
  });

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
          <h1
            className="text-2xl font-semibold font-heading"
            style={{ fontFamily: "var(--heading)", color: INK }}
          >
            Categories
          </h1>

          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Manage book categories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor: INK,
            color: "#C89B3C",
          }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E6DFCE] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả thể loại..."
            className="w-full rounded-md border border-[#E6DFCE] bg-[#F7F2E7] py-2 pl-9 pr-9 text-sm text-[#12192B] outline-none transition placeholder:text-gray-400 focus:border-[#B8863B] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">
            Hiển thị{" "}
            <span className="font-semibold text-gray-800">
              {filteredCategories.length}
            </span>{" "}
            / {categories.length} thể loại
          </span>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 text-xs font-semibold text-[#B8863B] hover:underline cursor-pointer"
            >
              <RotateCcw size={12} />
              Xóa tìm kiếm
            </button>
          )}
        </div>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            border: `1px solid ${OVERDUE}33`,
            backgroundColor: "#FBEFEC",
            color: OVERDUE,
          }}
        >
          {getDeleteErrorMessage()}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="rounded-lg bg-white p-6 text-sm"
          style={{ border: `1px solid ${BORDER}`, color: MUTED }}
        >
          Loading categories...
        </div>
      )}

      {/* Load error */}
      {isError && (
        <div
          className="rounded-lg p-6 text-sm"
          style={{
            border: `1px solid ${OVERDUE}33`,
            backgroundColor: "#FBEFEC",
            color: OVERDUE,
          }}
        >
          Failed to load categories.
        </div>
      )}

      {/* Empty when no categories created yet */}
      {!isLoading && !isError && categories.length === 0 && (
        <div
          className="rounded-lg bg-white p-10 text-center"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ border: `1px solid ${BRASS}55` }}
          >
            <FolderOpen size={20} style={{ color: BRASS }} />
          </div>

          <p className="mt-3 text-sm font-medium" style={{ color: INK }}>
            No categories found
          </p>

          <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
            Create your first category to get started.
          </p>
        </div>
      )}

      {/* Empty when search has no match */}
      {!isLoading &&
        !isError &&
        categories.length > 0 &&
        filteredCategories.length === 0 && (
          <div
            className="rounded-lg bg-white p-10 text-center"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ border: `1px solid ${BRASS}55` }}
            >
              <Search size={20} style={{ color: BRASS }} />
            </div>

            <p className="mt-3 text-sm font-medium" style={{ color: INK }}>
              Không tìm thấy thể loại nào
            </p>

            <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
              Không có thể loại nào khớp với từ khóa "{searchQuery}".
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#12192B] px-3.5 py-1.5 text-xs font-semibold text-[#C89B3C] transition hover:opacity-90 cursor-pointer"
            >
              <RotateCcw size={13} />
              Xóa tìm kiếm
            </button>
          </div>
        )}

      {/* Table */}
      {!isLoading && !isError && filteredCategories.length > 0 && (
        <div
          className="overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(18,25,43,0.06),0_8px_24px_-12px_rgba(18,25,43,0.14)]"
          style={{ border: "1px solid #D8CEB2" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead
                style={{
                  backgroundColor: "#EFE3C4",
                  borderBottom: "1px solid #D8CEB2",
                }}
              >
                <tr>
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    STT
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Name
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Description
                  </th>

                  <th
                    className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-[#FAF7EF]"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <td
                      className="px-6 py-4 text-center align-middle tabular-nums"
                      style={{ color: "#B0B7C4" }}
                    >
                      {index + 1}
                    </td>

                    <td
                      className="px-6 py-4 font-medium"
                      style={{ color: INK }}
                    >
                      {category.name}
                    </td>

                    <td
                      className="px-6 py-4"
                      style={{ color: "#6B7280", maxWidth: 420 }}
                    >
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          disabled={deleteMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F7F2E7] disabled:opacity-50 cursor-pointer"
                          style={{
                            border: `1px solid ${BRASS}55`,
                            color: BRASS,
                          }}
                        >
                          <Edit size={14} />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deleteMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#FBEFEC] disabled:opacity-50 cursor-pointer"
                            style={{
                              border: `1px solid ${OVERDUE}55`,
                              color: OVERDUE,
                            }}
                          >
                            <Trash size={14} />
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
