import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
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
  type UpdateProfileRequest,
} from "@/api/auth.api";

import { useAuthStore } from "@/store/auth.store";

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

export function UpdateProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: getProfile,
  });

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
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setUser(user);
  }, [user, reset, setUser]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),

    onSuccess: (updatedUser) => {
      setUser(updatedUser);

      queryClient.setQueryData(["profile", updatedUser.id], updatedUser);

      navigate("/profile", {
        replace: true,
      });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    const payload: UpdateProfileRequest = {
      username: data.username.trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
    };

    /*
     * Chỉ gửi password nếu người dùng thực sự
     * muốn thay đổi password.
     */
    if (data.newPassword) {
      payload.currentPassword = data.currentPassword ?? "";

      payload.newPassword = data.newPassword;
    }

    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <div className="h-[600px] animate-pulse rounded-2xl bg-white/60" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-600">
          Không thể tải thông tin cá nhân.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
        style={{
          color: "#A87324",
        }}
      >
        <ArrowLeft size={16} />
        Quay lại thông tin cá nhân
      </button>

      {/* Page heading */}
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{
            color: "#A87324",
          }}
        >
          Tài khoản / Hồ sơ
        </p>

        <h1
          className="mt-2 text-4xl font-semibold leading-tight"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "#12192B",
          }}
        >
          Cập nhật thông tin cá nhân
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Chỉnh sửa thông tin hồ sơ và bảo mật tài khoản.
        </p>
      </div>

      {/* Main form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="overflow-hidden rounded-2xl border border-[#E6DFCE] bg-white"
      >
        {/* ====================================================== */}
        {/* Profile information */}
        {/* ====================================================== */}
        <section className="p-8">
          <SectionHeading
            icon={UserRound}
            title="Thông tin hồ sơ"
            description="Cập nhật thông tin nhận diện và liên hệ của bạn."
          />

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {/* Username */}
            <FormField
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
            </FormField>

            {/* Full name */}
            <FormField
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
            </FormField>

            {/* Email */}
            <FormField
              icon={Mail}
              label="Địa chỉ email"
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                {...register("email")}
                className={inputClassName(Boolean(errors.email))}
                autoComplete="email"
              />
            </FormField>

            {/* Joined date */}
            <ReadOnlyField
              icon={CalendarDays}
              label="Ngày tham gia"
              value={formatJoinedDate(user.createdAt)}
              muted
            />
          </div>
        </section>

        {/* ====================================================== */}
        {/* Password */}
        {/* ====================================================== */}
        <section className="border-t border-[#EEE8DB] p-8">
          <SectionHeading
            icon={LockKeyhole}
            title="Thay đổi mật khẩu"
            description="Để trống nếu bạn không muốn thay đổi mật khẩu hiện tại."
          />

          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {/* Current password */}
            <PasswordField
              label="Mật khẩu hiện tại"
              error={errors.currentPassword?.message}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((current) => !current)}
              registration={register("currentPassword")}
            />

            {/* New password */}
            <PasswordField
              label="Mật khẩu mới"
              error={errors.newPassword?.message}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((current) => !current)}
              registration={register("newPassword")}
            />

            {/* Confirm password */}
            <PasswordField
              label="Xác nhận mật khẩu mới"
              error={errors.confirmPassword?.message}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              registration={register("confirmPassword")}
            />
          </div>

          {/* API error */}
          {mutation.isError && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {getMutationErrorMessage(mutation.error)}
            </div>
          )}
        </section>

        {/* ====================================================== */}
        {/* Footer */}
        {/* ====================================================== */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EEE8DB] px-8 py-5">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            disabled={mutation.isPending}
            className="rounded-lg border border-[#DED7C8] px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "#12192B",
            }}
          >
            <Save size={16} />

            {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================ */
/* Section Heading */
/* ============================================================ */

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "#FFF8E8",
          color: "#B8863B",
          border: "1px solid #EFD9A7",
        }}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2
          className="text-2xl font-semibold"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "#12192B",
          }}
        >
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Form Field */
/* ============================================================ */

function FormField({
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
      <label
        htmlFor={label}
        className="mb-2 block text-xs font-semibold text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={17} />
        </div>

        {children}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ============================================================ */
/* Read-only Field */
/* ============================================================ */

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div
        className="relative rounded-lg border border-[#DED7C8] px-10 py-3 text-sm"
        style={{
          backgroundColor: muted ? "#F3F1EC" : "#FFFFFF",
          color: muted ? "#6B7280" : "#374151",
        }}
      >
        <Icon
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <span className="break-words">{value}</span>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Password Field */
/* ============================================================ */

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
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          {...registration}
          type={visible ? "text" : "password"}
          className={inputClassName(Boolean(error), "pl-10 pr-11")}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ============================================================ */
/* Input class */
/* ============================================================ */

function inputClassName(hasError: boolean, extra = "pl-10") {
  return [
    "w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none transition",
    extra,
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#DED7C8] focus:border-[#B8863B] focus:ring-2 focus:ring-[#F7EFD9]",
  ].join(" ");
}

/* ============================================================ */
/* Helpers */
/* ============================================================ */

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
