import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AtSign,
  Camera,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  Shield,
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
import type { Role } from "@/types/auth";

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

function getRoleLabel(role?: Role) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "STAFF") return "Nhân viên thư viện";
  return "Bạn đọc thư viện";
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

  // Quản lý ảnh avatar & chống vỡ ảnh (fallback)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: getProfile,
  });

  const [prevAvatar, setPrevAvatar] = useState(user?.avatar);
  if (user?.avatar !== prevAvatar) {
    setPrevAvatar(user?.avatar);
    setImgLoadError(false);
  }

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
    setImgLoadError(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setAvatarError("Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP.");
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
    setImgLoadError(false);
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/profile", { replace: true });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-9 w-48 rounded-xl bg-gray-200" />
        <div className="h-20 w-80 rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 rounded-2xl bg-gray-100" />
          <div className="lg:col-span-8 h-96 rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="w-full">
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

  const shouldShowImage = currentAvatarUrl && !imgLoadError;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header & Điều hướng */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="cursor-pointer mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-amber-800"
          >
            <ArrowLeft size={14} />
            Quay lại thông tin cá nhân
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              <Shield size={12} />
              Cài đặt tài khoản
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Cập Nhật Hồ Sơ
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Chỉnh sửa ảnh đại diện, thông tin nhận diện, số điện thoại và bảo mật tài khoản
          </p>
        </div>
      </div>

      {/* Main Form Widescreen Layout (2 Cột) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* ====================================================== */}
          {/* CỘT TRÁI: Quản Lý Avatar & Tóm Tắt Tài Khoản (4 Cột) */}
          {/* ====================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card Avatar */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs text-center">
              <h2 className="text-sm font-bold text-gray-900">Ảnh đại diện</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Hiển thị trên hồ sơ và thanh tiêu đề của bạn
              </p>

              {/* Khối Avatar tròn lớn 128x128px */}
              <div className="mt-6 flex flex-col items-center">
                <div className="relative group">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-amber-300/80 bg-gray-50 shadow-md">
                    {shouldShowImage ? (
                      <img
                        src={currentAvatarUrl}
                        alt="Avatar"
                        onError={() => setImgLoadError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 text-4xl font-extrabold text-amber-100 font-mono">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Icon Camera trên Avatar */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-700 text-white shadow-md transition hover:bg-amber-800 active:scale-95"
                    title="Thay đổi ảnh đại diện"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {/* Input file ẩn */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {/* Cụm nút thao tác */}
                <div className="mt-5 flex w-full flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300 active:scale-98"
                  >
                    <Camera size={16} />
                    <span>Chọn ảnh mới</span>
                  </button>

                  {(currentAvatarUrl || avatarFile) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-100 active:scale-98"
                    >
                      <Trash2 size={14} />
                      <span>Xóa ảnh đại diện</span>
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                  Định dạng: JPG, PNG, WEBP. Dung lượng tối đa 5MB.
                </p>

                {avatarError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {avatarError}
                  </p>
                )}
              </div>
            </div>

            {/* Card Tóm Tắt Tài Khoản */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Tài khoản & Phân quyền
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-500">Vai trò</span>
                  <span className="font-semibold text-gray-900">
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {user.memberCode && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span className="text-gray-500">Mã độc giả</span>
                    <span className="font-mono font-semibold text-amber-800">
                      {user.memberCode}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {user.isActive ? "Đang hoạt động" : "Bị khóa"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Ngày gia nhập</span>
                  <span className="font-medium text-gray-700">
                    {formatJoinedDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* CỘT PHẢI: Form Cập Nhật Thông Tin & Bảo Mật (8 Cột) */}
          {/* ====================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Khối 1: Thông tin cơ bản */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
              <SectionTitle
                icon={UserRound}
                title="Thông tin cơ bản"
                description="Cập nhật các thông tin cá nhân và phương thức liên lạc của bạn"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Tên đăng nhập */}
                <FieldContainer
                  icon={AtSign}
                  label="Tên đăng nhập"
                  error={errors.username?.message}
                >
                  <input
                    id="username"
                    type="text"
                    {...register("username")}
                    className={inputClass(Boolean(errors.username))}
                    autoComplete="username"
                  />
                </FieldContainer>

                {/* Họ và tên */}
                <FieldContainer
                  icon={UserRound}
                  label="Họ và tên"
                  error={errors.fullName?.message}
                >
                  <input
                    id="fullName"
                    type="text"
                    {...register("fullName")}
                    className={inputClass(Boolean(errors.fullName))}
                    autoComplete="name"
                  />
                </FieldContainer>

                {/* Số điện thoại */}
                <FieldContainer
                  icon={Phone}
                  label="Số điện thoại"
                  error={errors.phone?.message}
                >
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    {...register("phone")}
                    className={inputClass(Boolean(errors.phone))}
                    autoComplete="tel"
                  />
                </FieldContainer>

                {/* Địa chỉ email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700"
                  >
                    <span>Địa chỉ email</span>
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={17} />
                    </div>

                    <input
                      id="email"
                      type="email"
                      disabled={isStaff}
                      readOnly={isStaff}
                      {...register("email")}
                      className={
                        isStaff
                          ? "w-full rounded-xl border border-gray-200 bg-gray-100/80 py-3 pl-11 pr-10 text-sm font-medium text-gray-500 cursor-not-allowed shadow-2xs outline-none"
                          : inputClass(Boolean(errors.email))
                      }
                      autoComplete="email"
                    />

                    {isStaff && (
                      <div
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-700"
                        title="Email nhân viên do Quản trị viên cấp"
                      >
                        <Lock size={16} />
                      </div>
                    )}
                  </div>

                  {errors.email?.message && !isStaff && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mã độc giả & Ngày tham gia */}
                {user.memberCode && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Mã thẻ độc giả
                    </label>
                    <div className="relative flex items-center rounded-xl border border-gray-200/80 bg-gray-50/60 py-3 pl-11 pr-4 text-sm font-mono font-semibold text-amber-900 shadow-2xs">
                      <IdCard
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <span>{user.memberCode}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 2: Bảo mật & Đổi mật khẩu */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                <SectionTitle
                  icon={LockKeyhole}
                  title="Thay đổi mật khẩu"
                  description="Để trống các trường này nếu bạn không có nhu cầu đổi mật khẩu hiện tại"
                />

                <div className="grid gap-5 sm:grid-cols-3">
                  {/* Mật khẩu hiện tại */}
                  <PasswordInput
                    label="Mật khẩu hiện tại"
                    error={errors.currentPassword?.message}
                    visible={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword((prev) => !prev)}
                    registration={register("currentPassword")}
                  />

                  {/* Mật khẩu mới */}
                  <PasswordInput
                    label="Mật khẩu mới"
                    error={errors.newPassword?.message}
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((prev) => !prev)}
                    registration={register("newPassword")}
                  />

                  {/* Xác nhận mật khẩu mới */}
                  <PasswordInput
                    label="Xác nhận mật khẩu mới"
                    error={errors.confirmPassword?.message}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                    registration={register("confirmPassword")}
                  />
                </div>

                {/* Lỗi API nếu có */}
                {mutation.isError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-2xs">
                    {getMutationErrorMessage(mutation.error)}
                  </div>
                )}
              </div>
            </div>

            {/* Khối 3: Nút Lưu Thay Đổi */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={mutation.isPending}
                className="cursor-pointer w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 sm:w-auto"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3 text-sm font-semibold text-amber-400 shadow-sm transition hover:bg-black active:scale-98 disabled:opacity-50 sm:w-auto"
              >
                {mutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                    <span>Đang lưu thay đổi...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon size={19} />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FieldContainer({
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
          <Icon size={17} />
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
}

function PasswordInput({
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
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          {...registration}
          type={visible ? "text" : "password"}
          className={inputClass(Boolean(error), "pl-11 pr-11")}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean, extra = "pl-11 pr-4") {
  return [
    "w-full rounded-xl border bg-white py-3 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400",
    extra,
    hasError
      ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
      : "border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
  ].join(" ");
}
