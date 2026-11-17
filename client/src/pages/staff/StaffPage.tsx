import { useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Plus,
  Search,
  X,
  RotateCcw,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  Mail,
} from "lucide-react";

import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useUpdateStaffStatus,
  useDeleteStaff,
} from "@/hooks/use-staff";
import { StaffModal } from "@/components/staff/StaffModal";
import type { CreateStaffFormData } from "@/schemas/staff.schema";
import type { Staff } from "@/api/staff.api";

export function StaffPage() {
  const { data: staff = [], isLoading, isError } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const statusMutation = useUpdateStaffStatus();
  const deleteMutation = useDeleteStaff();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Lọc danh sách nhân viên
  const query = searchQuery.trim().toLowerCase();
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      if (query) {
        const matchName = member.fullName.toLowerCase().includes(query);
        const matchEmail = member.email.toLowerCase().includes(query);
        const matchUsername = member.username.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchUsername) {
          return false;
        }
      }

      if (statusFilter === "active" && !member.isActive) return false;
      if (statusFilter === "inactive" && member.isActive) return false;

      return true;
    });
  }, [staff, query, statusFilter]);

  // Thống kê nhanh
  const totalCount = staff.length;
  const activeCount = useMemo(() => staff.filter((s) => s.isActive).length, [staff]);
  const inactiveCount = totalCount - activeCount;

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== "all");

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleOpenCreate = () => {
    createMutation.reset();
    updateMutation.reset();
    setSelectedStaff(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Staff) => {
    createMutation.reset();
    updateMutation.reset();
    setSelectedStaff(member);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const handleSubmit = async (data: CreateStaffFormData) => {
    createMutation.reset();
    updateMutation.reset();

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          fullName: data.fullName,
          email: data.email,
        });
      } else if (selectedStaff) {
        await updateMutation.mutateAsync({
          id: selectedStaff.id,
          data: {
            fullName: data.fullName,
            email: data.email,
          },
        });
      }

      handleCloseModal();
    } catch {
      // Lỗi được hiển thị qua mutation state
    }
  };

  const handleToggleStatus = async (member: Staff) => {
    const nextStatus = !member.isActive;
    const actionText = nextStatus ? "KÍCH HOẠT" : "TẠM DỪNG";

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionText} tài khoản của nhân viên "${member.fullName}" (@${member.username}) không?`
    );

    if (!confirmed) return;

    try {
      await statusMutation.mutateAsync({
        id: member.id,
        isActive: nextStatus,
      });
    } catch {
      // Lỗi được hiển thị qua getStatusErrorMessage()
    }
  };

  const handleDelete = async (member: Staff) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn XÓA VĨNH VIỄN nhân viên "${member.fullName}" khỏi hệ thống?\nHành động này không thể hoàn tác.`
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(member.id);
    } catch {
      // Lỗi được hiển thị qua getDeleteErrorMessage()
    }
  };

  const getMutationError = () => {
    const error = modalMode === "edit" ? updateMutation.error : createMutation.error;
    if (!error) return null;

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Địa chỉ email này đã tồn tại trong hệ thống.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Không tìm thấy thông tin nhân viên.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "Bạn không có quyền chỉnh sửa tài khoản nhân viên.";
    }

    return modalMode === "edit"
      ? "Cập nhật nhân viên thất bại. Vui lòng thử lại sau."
      : "Tạo nhân viên mới thất bại. Vui lòng thử lại sau.";
  };

  const getStatusErrorMessage = () => {
    const error = statusMutation.error;
    if (!error) return null;

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Không tìm thấy nhân viên.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "Bạn không có quyền thay đổi trạng thái nhân viên.";
    }

    return "Cập nhật trạng thái nhân viên thất bại. Vui lòng thử lại.";
  };

  const getDeleteErrorMessage = () => {
    const error = deleteMutation.error;
    if (!error) return null;

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Không tìm thấy nhân viên cần xóa.";
    }
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "Bạn không có quyền xóa tài khoản nhân viên.";
    }

    return "Xóa nhân viên thất bại. Vui lòng thử lại sau.";
  };

  const getInitials = (name: string) => {
    if (!name) return "NV";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const modalInitialData = selectedStaff
    ? {
        fullName: selectedStaff.fullName,
        email: selectedStaff.email,
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
              <Shield size={12} />
              Đội ngũ nhân sự thư viện
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 font-heading">
            Quản lý tài khoản nhân viên
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh sách nhân viên, thiết lập quyền hạn và kiểm soát trạng thái hoạt động trong hệ thống.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black shrink-0"
        >
          <Plus size={16} />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      {/* Thẻ Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng số nhân viên</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đang hoạt động</p>
            <p className="mt-0.5 text-xl font-bold text-emerald-700">{activeCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Ngừng hoạt động / Khóa</p>
            <p className="mt-0.5 text-xl font-bold text-rose-700">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, email hoặc username..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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

          {/* Lọc trạng thái */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              aria-label="Lọc theo trạng thái tài khoản"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        {/* Tóm tắt số lượng & Nút đặt lại */}
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Hiển thị <strong className="text-gray-900">{filteredStaff.length}</strong> / {totalCount} nhân viên
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50"
              title="Đặt lại tất cả bộ lọc"
            >
              <RotateCcw size={13} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Thông báo lỗi thao tác */}
      {(statusMutation.error || deleteMutation.error) && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{getStatusErrorMessage() || getDeleteErrorMessage()}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              statusMutation.reset();
              deleteMutation.reset();
            }}
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

      {/* Error State */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="mt-2 text-sm font-semibold text-red-800">Không thể tải danh sách nhân viên</p>
          <p className="mt-1 text-xs text-red-600">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && !isError && staff.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Users size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Chưa có tài khoản nhân viên nào</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
            Hãy tạo tài khoản nhân viên đầu tiên để phân quyền quản lý thư viện.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="cursor-pointer mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-black"
          >
            <Plus size={15} />
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && staff.length > 0 && filteredStaff.length === 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <Search size={28} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Không tìm thấy nhân viên phù hợp</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
            Không có nhân viên nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="cursor-pointer mt-5 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
          >
            <RotateCcw size={13} />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      )}

      {/* Bảng Dữ Liệu Nhân Viên */}
      {!isLoading && !isError && filteredStaff.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="w-16 px-4 py-3.5 text-center">STT</th>
                  <th className="min-w-[220px] px-6 py-3.5">Nhân viên</th>
                  <th className="min-w-[220px] px-6 py-3.5">Tài khoản & Email</th>
                  <th className="min-w-[140px] px-6 py-3.5 text-center">Vai trò</th>
                  <th className="min-w-[140px] px-6 py-3.5 text-center">Trạng thái</th>
                  <th className="min-w-[140px] px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((member, index) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-amber-50/25"
                  >
                    {/* STT */}
                    <td className="px-4 py-4 text-center font-mono text-xs text-gray-400">
                      {index + 1}
                    </td>

                    {/* Nhân viên (Avatar initials + Tên) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xs font-bold text-amber-800 shadow-2xs">
                          {getInitials(member.fullName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {member.fullName}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            ID: #{member.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tài khoản & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <span>{member.email}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400 font-mono">
                        @{member.username}
                      </div>
                    </td>

                    {/* Vai trò */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200/60 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        <Shield size={12} className="text-blue-600" />
                        Thủ thư
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4 text-center">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Đã tạm khóa
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nút sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          disabled={statusMutation.isPending}
                          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                          title="Chỉnh sửa thông tin nhân viên"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Nút toggle trạng thái */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={statusMutation.isPending}
                          className={`cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-2xs transition disabled:opacity-50 ${
                            member.isActive
                              ? "border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          title={member.isActive ? "Tạm dừng tài khoản" : "Kích hoạt lại tài khoản"}
                        >
                          {member.isActive ? (
                            <Lock size={14} />
                          ) : (
                            <Unlock size={14} />
                          )}
                        </button>

                        {/* Nút xóa (chỉ khi tài khoản đã bị khóa) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          disabled={
                            member.isActive ||
                            statusMutation.isPending ||
                            deleteMutation.isPending
                          }
                          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title={
                            member.isActive
                              ? "Cần tạm khóa tài khoản trước khi xóa"
                              : "Xóa tài khoản nhân viên"
                          }
                        >
                          <Trash2 size={14} />
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

      {/* Modal Thêm/Sửa Nhân Viên */}
      <StaffModal
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
