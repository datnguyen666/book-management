import { useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Folder,
  Plus,
  Search,
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

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

type ModalMode = "create" | "edit";

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading, isError } = useCategories();

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Lọc thể loại theo từ khóa tìm kiếm
  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (!query) return true;
      const matchName = cat.name.toLowerCase().includes(query);
      const matchDesc = cat.description ? cat.description.toLowerCase().includes(query) : false;
      return matchName || matchDesc;
    });
  }, [categories, query]);

  // Thống kê nhanh
  const totalCount = categories.length;
  const withDescCount = useMemo(() => {
    return categories.filter((c) => Boolean(c.description?.trim())).length;
  }, [categories]);

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
    if (isSubmitting) return;
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
      // Lỗi được hiển thị qua getMutationError()
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa thể loại "${category.name}" không?\nLưu ý: Chỉ có thể xóa thể loại khi không còn đầu sách nào thuộc thể loại này.`
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(category.id);
    } catch {
      // Lỗi được hiển thị qua getDeleteErrorMessage()
    }
  };

  const getMutationError = () => {
    const error = modalMode === "edit" ? updateMutation.error : createMutation.error;
    if (!error) return null;

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Tên thể loại này đã tồn tại trong hệ thống.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Không tìm thấy thể loại cần chỉnh sửa.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return "Dữ liệu thể loại không hợp lệ.";
    }

    return modalMode === "edit"
      ? "Cập nhật thể loại thất bại. Vui lòng thử lại sau."
      : "Thêm thể loại mới thất bại. Vui lòng thử lại sau.";
  };

  const deleteError = deleteMutation.error;
  const getDeleteErrorMessage = () => {
    if (!deleteError) return null;

    if (axios.isAxiosError(deleteError) && deleteError.response?.status === 409) {
      return "Không thể xóa thể loại này vì hiện đang có sách thuộc thể loại trong thư viện.";
    }
    if (axios.isAxiosError(deleteError) && deleteError.response?.status === 404) {
      return "Thể loại không tồn tại hoặc đã bị xóa.";
    }
    if (axios.isAxiosError(deleteError) && deleteError.response?.status === 403) {
      return "Bạn không có quyền xóa thể loại sách.";
    }

    return "Xóa thể loại thất bại. Vui lòng kiểm tra lại.";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">
              <Folder size={12} />
              Hệ thống phân loại thư viện
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 font-heading">
            Danh mục thể loại sách
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và thiết lập cấu trúc phân loại đầu sách trong toàn bộ hệ thống thư viện.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black shrink-0"
        >
          <Plus size={16} />
          <span>Thêm thể loại mới</span>
        </button>
      </div>

      {/* Thẻ Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FolderOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng số thể loại</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Có mô tả chi tiết</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">
              {withDescCount} <span className="text-xs font-normal text-gray-400">/ {totalCount}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Trạng thái phân loại</p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-700">Hoạt động ổn định</p>
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Lọc */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc mô tả thể loại..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Tìm thấy <strong className="text-gray-900">{filteredCategories.length}</strong> / {totalCount} thể loại
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
            >
              <RotateCcw size={12} />
              Đặt lại
            </button>
          </div>
        )}
      </div>

      {/* Thông báo lỗi khi xóa */}
      {deleteError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{getDeleteErrorMessage()}</span>
          </div>
          <button
            type="button"
            onClick={() => deleteMutation.reset()}
            className="cursor-pointer text-xs font-semibold text-red-700 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="space-y-4">
            <div className="h-6 w-48 rounded-lg bg-gray-100 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full rounded-lg bg-gray-50 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lỗi tải danh sách */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="mt-2 text-sm font-semibold text-red-800">Không thể tải danh sách thể loại</p>
          <p className="mt-1 text-xs text-red-600">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng tải lại trang.
          </p>
        </div>
      )}

      {/* Trạng thái rỗng khi chưa có thể loại nào */}
      {!isLoading && !isError && categories.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <FolderOpen size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Chưa có thể loại sách nào</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
            Hãy tạo danh mục thể loại đầu tiên để bắt đầu phân loại các đầu sách trong thư viện.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="cursor-pointer mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-black"
          >
            <Plus size={15} />
            <span>Thêm thể loại mới</span>
          </button>
        </div>
      )}

      {/* Trạng thái rỗng khi tìm kiếm không có kết quả */}
      {!isLoading && !isError && categories.length > 0 && filteredCategories.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Search size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Không tìm thấy thể loại phù hợp</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
            Không có kết quả nào khớp với từ khóa "{searchQuery}". Vui lòng thử từ khóa khác.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="cursor-pointer mt-5 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
          >
            <RotateCcw size={13} />
            <span>Xóa tìm kiếm</span>
          </button>
        </div>
      )}

      {/* BẢNG DỮ LIỆU HIỆN ĐẠI (TABLE VIEW ONLY) */}
      {!isLoading && !isError && filteredCategories.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="w-16 px-4 py-3.5 text-center">STT</th>
                  <th className="min-w-[200px] px-6 py-3.5">Tên thể loại</th>
                  <th className="min-w-[320px] px-6 py-3.5">Mô tả chi tiết</th>
                  <th className="min-w-[140px] px-6 py-3.5">Đầu sách</th>
                  <th className="min-w-[120px] px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-amber-50/25"
                  >
                    {/* Cột 1: STT */}
                    <td className="px-4 py-4 text-center font-mono text-xs text-gray-400">
                      {index + 1}
                    </td>

                    {/* Cột 2: Tên thể loại */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200/60 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          <Folder size={13} className="text-purple-600" />
                          {category.name}
                        </span>
                      </div>
                    </td>

                    {/* Cột 3: Mô tả chi tiết */}
                    <td className="px-6 py-4">
                      {category.description ? (
                        <p className="line-clamp-2 max-w-xl text-xs leading-relaxed text-gray-600">
                          {category.description}
                        </p>
                      ) : (
                        <span className="text-xs italic text-gray-400">Chưa có mô tả</span>
                      )}
                    </td>

                    {/* Cột 4: Đầu sách thuộc thể loại */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/books?categoryId=${category.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/70 bg-amber-50/60 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 hover:text-amber-900"
                        title={`Xem danh sách các đầu sách thuộc thể loại ${category.name}`}
                      >
                        <BookOpen size={13} className="text-amber-600" />
                        <span>Xem sách</span>
                        <ArrowUpRight size={12} className="text-amber-500" />
                      </Link>
                    </td>

                    {/* Cột 5: Thao tác */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          disabled={deleteMutation.isPending}
                          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                          title="Chỉnh sửa thông tin thể loại"
                        >
                          <Pencil size={14} />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deleteMutation.isPending}
                            className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Xóa thể loại (chỉ dành cho Quản trị viên)"
                          >
                            <Trash2 size={14} />
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
