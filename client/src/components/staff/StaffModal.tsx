import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, UserCheck, AlertCircle, Info } from "lucide-react";

import {
  createStaffSchema,
  type CreateStaffFormData,
} from "@/schemas/staff.schema";

type ModalMode = "create" | "edit";

interface StaffModalProps {
  isOpen: boolean;
  mode: ModalMode;
  initialData?: {
    fullName: string;
    email: string;
  };
  onClose: () => void;
  onSubmit: (data: CreateStaffFormData) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function StaffModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: StaffModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      email: initialData?.email ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        fullName: initialData?.fullName || "",
        email: initialData?.email || "",
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const isCreate = mode === "create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              {isCreate ? <UserPlus size={20} /> : <UserCheck size={20} />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {isCreate ? "Thêm nhân viên mới" : "Chỉnh sửa thông tin nhân viên"}
              </h2>
              <p className="text-xs text-gray-500">
                {isCreate
                  ? "Tạo tài khoản mới cho nhân viên thư viện."
                  : "Cập nhật họ tên và email của nhân viên."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
            {/* Error Notification */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Họ và tên */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Họ và tên nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                {...register("fullName")}
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A..."
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="nhanvien@thuvien.local"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Thông báo tự động cấp mật khẩu khi tạo mới */}
            {isCreate && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800 leading-relaxed">
                <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>
                  Tên đăng nhập và mật khẩu khởi tạo sẽ được hệ thống sinh tự động và gửi qua email cho nhân viên.
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
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
                ? isCreate
                  ? "Đang tạo..."
                  : "Đang lưu..."
                : isCreate
                ? "Tạo nhân viên"
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
