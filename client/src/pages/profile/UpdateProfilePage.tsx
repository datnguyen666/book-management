import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Camera,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  getProfile,
  updateProfile,
  uploadAvatar,
  type UpdateProfileRequest,
} from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { getMediaUrl } from "@/lib/media";

const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Tên đăng nhập là bắt buộc.")
      .max(50, "Tên đăng nhập không được vượt quá 50 ký tự."),

    fullName: z
      .string()
      .trim()
      .min(1, "Họ và tên là bắt buộc.")
      .max(255, "Họ và tên không được vượt quá 255 ký tự."),

    email: z
      .string()
      .trim()
      .email("Địa chỉ email không hợp lệ.")
      .max(255, "Địa chỉ email không được vượt quá 255 ký tự."),

    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{10}$/.test(val),
        "Số điện thoại phải gồm đúng 10 chữ số.",
      ),

    currentPassword: z.string().optional(),

    newPassword: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.length >= 8,
        "Mật khẩu mới phải có ít nhất 8 ký tự.",
      ),

    confirmPassword: z.string().optional(),
  })
  .superRefine((data, context) => {
    const hasCurrentPassword = Boolean(data.currentPassword?.length);
    const hasNewPassword = Boolean(data.newPassword?.length);
    const hasConfirmPassword = Boolean(data.confirmPassword?.length);

    if (hasNewPassword && !hasCurrentPassword) {
      context.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Vui lòng nhập mật khẩu hiện tại.",
      });
    }

    if (hasCurrentPassword && !hasNewPassword) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Vui lòng nhập mật khẩu mới.",
      });
    }

    if (hasConfirmPassword && !hasNewPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Vui lòng nhập mật khẩu mới trước.",
      });
    }

    if (hasNewPassword && data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận không khớp.",
      });
    }
  });

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

function getInitials(fullName?: string, username?: string) {
  const source = (fullName || username || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function formatJoinedDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getMutationErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Không thể cập nhật thông tin. Vui lòng thử lại.";
}

export function UpdateProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Quản lý ảnh avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: getProfile,
  });

  const isStaff = user?.role === "STAFF";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      username: user.username,
      fullName: user.fullName || "",
      email: user.email,
      phone: user.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setUser(user);
  }, [user, reset, setUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setAvatarError("Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP.");
      return;
    }

    // Kiểm tra dung lượng < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Dung lượng ảnh không được vượt quá 5MB.");
      return;
    }

    setAvatarFile(file);
    setIsRemovingAvatar(false);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsRemovingAvatar(true);
    setAvatarError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileFormData) => {
      let avatarFilename: string | undefined = undefined;

      // 1. Nếu có chọn file ảnh mới -> Upload trước
      if (avatarFile) {
        const uploadRes = await uploadAvatar(avatarFile);
        avatarFilename = uploadRes.avatar;
      } else if (isRemovingAvatar) {
        avatarFilename = "";
      }

      // 2. Cập nhật thông tin profile
      const payload: UpdateProfileRequest = {
        username: data.username.trim(),
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || "",
      };

      // Chỉ gửi email nếu KHÔNG phải vai trò STAFF
      if (!isStaff) {
        payload.email = data.email.trim();
      }

      if (avatarFilename !== undefined) {
        payload.avatar = avatarFilename;
      }

      if (data.newPassword) {
        payload.currentPassword = data.currentPassword ?? "";
        payload.newPassword = data.newPassword;
      }

      return updateProfile(payload);
    },

    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(["profile", updatedUser.id], updatedUser);
      navigate("/profile", { replace: true });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-pulse">
        <div className="h-9 w-48 rounded-xl bg-gray-200" />
        <div className="h-[500px] rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-2xs">
          Không thể tải thông tin cá nhân. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  // Xác định ảnh hiển thị hiện tại
  const initials = getInitials(user.fullName, user.username);
  const currentAvatarUrl = isRemovingAvatar
    ? null
    : avatarPreview || (user.avatar ? getMediaUrl(user.avatar) : null);

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
      {/* Nút quay lại */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition hover:text-amber-800"
        >
          <ArrowLeft size={15} />
          Quay lại thông tin cá nhân
        </button>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Cập nhật hồ sơ
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Chỉnh sửa thông tin nhận diện, số điện thoại và bảo mật tài khoản
        </p>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs"
      >
        {/* ====================================================== */}
        {/* 1. Phần Ảnh Đại Diện (Avatar Section) */}
        {/* ====================================================== */}
        <div className="border-b border-gray-100 p-5 sm:p-7 bg-gray-50/40">
          <SectionHeader
            icon={Camera}
            title="Ảnh đại diện"
            description="Ảnh đại diện sẽ xuất hiện trên hồ sơ và thanh tiêu đề của bạn."
          />

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            {/* Vùng Avatar Preview */}
            <div className="relative group">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-3 border-amber-300 bg-white shadow-md">
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-3xl font-extrabold text-amber-100 font-mono">
                    {initials}
                  </div>
                )}
              </div>

              {/* Icon Camera trên ảnh */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-white shadow-md transition hover:bg-amber-800 active:scale-95"
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Input file ẩn & Nút thao tác */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300"
                >
                  <Camera size={14} />
                  <span>Chọn ảnh mới</span>
                </button>

                {(currentAvatarUrl || avatarFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-100"
                  >
                    <Trash2 size={13} />
                    <span>Xóa ảnh</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-gray-400">
                Hỗ trợ định dạng JPG, PNG, WEBP. Kích thước khuyến nghị 1:1, dung lượng tối đa 5MB.
              </p>

              {avatarError && (
                <p className="text-xs font-medium text-rose-600">
                  {avatarError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 2. Thông Tin Hồ Sơ (Personal Information) */}
        {/* ====================================================== */}
        <div className="p-5 sm:p-7 space-y-5">
          <SectionHeader
            icon={UserRound}
            title="Thông tin cơ bản"
            description="Cập nhật các thông tin cá nhân và phương thức liên lạc của bạn."
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {/* Username */}
            <FormItem
              icon={AtSign}
              label="Tên đăng nhập"
              error={errors.username?.message}
            >
              <input
                id="username"
                type="text"
                {...register("username")}
                className={inputClassName(Boolean(errors.username))}
                autoComplete="username"
              />
            </FormItem>

            {/* Họ và tên */}
            <FormItem
              icon={UserRound}
              label="Họ và tên"
              error={errors.fullName?.message}
            >
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                className={inputClassName(Boolean(errors.fullName))}
                autoComplete="name"
              />
            </FormItem>

            {/* Số điện thoại */}
            <FormItem
              icon={Phone}
              label="Số điện thoại"
              error={errors.phone?.message}
            >
              <input
                id="phone"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                {...register("phone")}
                className={inputClassName(Boolean(errors.phone))}
                autoComplete="tel"
              />
            </FormItem>

            {/* Email (Khóa nếu là STAFF) */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700"
              >
                <span>Địa chỉ email</span>
                {isStaff && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-normal text-amber-700">
                    <Lock size={11} /> Cố định theo vai trò
                  </span>
                )}
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>

                <input
                  id="email"
                  type="email"
                  disabled={isStaff}
                  readOnly={isStaff}
                  {...register("email")}
                  className={
                    isStaff
                      ? "w-full rounded-xl border border-gray-200 bg-gray-100/80 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-500 cursor-not-allowed shadow-2xs outline-none"
                      : inputClassName(Boolean(errors.email))
                  }
                  autoComplete="email"
                />

                {isStaff && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700"
                    title="Email nhân viên do Quản trị viên cấp"
                  >
                    <Lock size={15} />
                  </div>
                )}
              </div>

              {errors.email?.message && !isStaff && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.email.message}
                </p>
              )}

              {isStaff && (
                <p className="mt-1.5 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-lg p-2">
                  Tài khoản Nhân viên không được phép tự thay đổi email. Vui lòng liên hệ Quản trị viên nếu cần cấp đổi.
                </p>
              )}
            </div>

            {/* Ngày gia nhập (Read-only) */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Ngày tham gia hệ thống
              </label>
              <div className="relative flex items-center rounded-xl border border-gray-200/80 bg-gray-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-gray-600 shadow-2xs">
                <CalendarDays
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <span>{formatJoinedDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 3. Đổi Mật Khẩu (Security Section) */}
        {/* ====================================================== */}
        <div className="border-t border-gray-100 p-5 sm:p-7 space-y-5 bg-gray-50/20">
          <SectionHeader
            icon={LockKeyhole}
            title="Thay đổi mật khẩu"
            description="Để trống các trường này nếu bạn không có nhu cầu đổi mật khẩu."
          />

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {/* Mật khẩu hiện tại */}
            <PasswordField
              label="Mật khẩu hiện tại"
              error={errors.currentPassword?.message}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((prev) => !prev)}
              registration={register("currentPassword")}
            />

            {/* Mật khẩu mới */}
            <PasswordField
              label="Mật khẩu mới"
              error={errors.newPassword?.message}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
              registration={register("newPassword")}
            />

            {/* Xác nhận mật khẩu mới */}
            <PasswordField
              label="Xác nhận mật khẩu mới"
              error={errors.confirmPassword?.message}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              registration={register("confirmPassword")}
            />
          </div>

          {/* Lỗi API nếu có */}
          {mutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 shadow-2xs">
              {getMutationErrorMessage(mutation.error)}
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* Footer Actions */}
        {/* ====================================================== */}
        <div className="flex flex-col-reverse gap-2.5 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            disabled={mutation.isPending}
            className="cursor-pointer w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-black disabled:opacity-50 sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <span>Đang lưu thay đổi...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon size={17} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FormItem({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: typeof UserRound;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  error,
  visible,
  onToggle,
  registration,
}: {
  label: string;
  error?: string;
  visible: boolean;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          {...registration}
          type={visible ? "text" : "password"}
          className={inputClassName(Boolean(error), "pl-10 pr-10")}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
}

function inputClassName(hasError: boolean, extra = "pl-10 pr-3.5") {
  return [
    "w-full rounded-xl border bg-white py-2.5 text-xs text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400",
    extra,
    hasError
      ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
      : "border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
  ].join(" ");
}
