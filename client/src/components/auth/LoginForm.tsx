import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import {
  Eye,
  EyeOff,
  X,
  Mail,
  LockKeyhole,
  AlertCircle,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  forgotPassword,
  getProfile,
  login,
  resetPassword,
} from "@/api/auth.api";

import { useAuthStore } from "@/store/auth.store";
import type { LoginPortal } from "@/types/auth";
import { PortalSelector } from "./PortalSelector";
import { loginSchema, type LoginFormData } from "@/features/auth/login.schema";

interface LoginFormProps {
  portal?: LoginPortal;
  onPortalChange?: (portal: LoginPortal) => void;
}

export function LoginForm({ portal, onPortalChange }: LoginFormProps) {
  const [internalPortal, setInternalPortal] = useState<LoginPortal>("MEMBER");
  const currentPortal = portal ?? internalPortal;

  const handlePortalChange = (nextPortal: LoginPortal) => {
    if (onPortalChange) {
      onPortalChange(nextPortal);
    } else {
      setInternalPortal(nextPortal);
    }
    setLoginError("");
  };

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(() => Boolean(resetToken));

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      portal: currentPortal,
    },
  });

  useEffect(() => {
    setValue("portal", currentPortal);
  }, [currentPortal, setValue]);

  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  const handleQuickFill = (username: string, password: string) => {
    setValue("username", username, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setLoginError("");
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");
    try {
      // 1. Đăng nhập theo cổng
      const loginResponse = await login({
        username: data.username,
        password: data.password,
        portal: currentPortal,
      });

      // 2. Lưu JWT
      setAccessToken(loginResponse.accessToken);

      // 3. Lấy thông tin người dùng
      const profile = await getProfile();

      // 4. Lưu User vào Zustand store
      setUser(profile);

      // 5. Điều hướng theo trạng thái tài khoản hoặc vai trò
      if (profile.mustChangePassword) {
        navigate("/set-password");
        return;
      }

      if (profile.role === "MEMBER") {
        navigate("/books");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as AxiosError<{ message?: string | string[] }>;
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      if (status && status >= 500) {
        setLoginError(
          "Lỗi hệ thống máy chủ (500). Vui lòng thử lại sau.",
        );
      } else if (typeof serverMessage === "string" && serverMessage.trim()) {
        setLoginError(serverMessage);
      } else if (Array.isArray(serverMessage) && serverMessage.length > 0) {
        setLoginError(serverMessage[0]);
      } else if (status === 401 || status === 400) {
        setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else {
        setLoginError(
          err?.message || "Không thể kết nối đến máy chủ, vui lòng thử lại.",
        );
      }
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!forgotEmail.trim()) {
      setForgotMessage("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    if (!emailPattern.test(forgotEmail.trim())) {
      setForgotMessage("Địa chỉ email không đúng định dạng.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await forgotPassword({
        email: forgotEmail.trim(),
      });

      setForgotMessage(
        response.message ||
          "Yêu cầu đã được gửi. Vui lòng kiểm tra hộp thư email của bạn.",
      );
    } catch (error) {
      console.error(error);
      // Thông báo an toàn
      setForgotMessage(
        "Nếu email tồn tại trong hệ thống, liên kết khôi phục sẽ được gửi tới hộp thư của bạn.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetMessage("");
    setResetError("");

    if (!resetToken) {
      setResetError("Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (resetPasswordValue.length < 8) {
      setResetError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (resetPasswordValue !== confirmPassword) {
      setResetError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setResetLoading(true);

    try {
      const response = await resetPassword({
        token: resetToken,
        password: resetPasswordValue,
      });

      setResetMessage(response.message || "Đặt lại mật khẩu thành công!");

      setResetPasswordValue("");
      setConfirmPassword("");

      // Xóa token khỏi URL
      setSearchParams({});

      // Đóng modal sau khi hoàn tất
      setTimeout(() => {
        setShowResetPassword(false);
        setResetMessage("");
        setResetError("");
      }, 1500);
    } catch (error) {
      console.error(error);
      setResetError("Đường dẫn đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    if (forgotLoading) return;
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotMessage("");
  };

  const closeResetPassword = () => {
    if (resetLoading) return;
    setShowResetPassword(false);
    setResetMessage("");
    setResetError("");
    setResetPasswordValue("");
    setConfirmPassword("");
    setSearchParams({});
  };

  return (
    <>
      <PortalSelector
        portal={currentPortal}
        onChange={handlePortalChange}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Banner thông báo lỗi đăng nhập */}
        {loginError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium leading-relaxed">{loginError}</p>
                {loginError.includes("cổng Bạn đọc") && (
                  <button
                    type="button"
                    onClick={() => handlePortalChange("MEMBER")}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#8A5A1E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#724814] cursor-pointer shadow-xs"
                  >
                    Chuyển sang cổng Bạn đọc ngay
                  </button>
                )}
                {loginError.includes("cổng Quản trị") && (
                  <button
                    type="button"
                    onClick={() => handlePortalChange("MANAGEMENT")}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#2b1608] px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-black cursor-pointer shadow-xs"
                  >
                    Chuyển sang cổng Quản trị ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tên đăng nhập */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Tên đăng nhập
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <User className="h-4 w-4" />
            </div>
            <input
              {...register("username")}
              type="text"
              autoComplete="username"
              placeholder={
                currentPortal === "MEMBER"
                  ? "Nhập tên đăng nhập độc giả"
                  : "Nhập tài khoản thủ thư / quản trị"
              }
              className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8A5A1E] focus:ring-2 focus:ring-[#8A5A1E]/20"
            />
          </div>

          {errors.username && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotMessage("");
              }}
              className="text-xs text-[#8A5A1E] hover:text-[#724814] hover:underline cursor-pointer font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-11 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8A5A1E] focus:ring-2 focus:ring-[#8A5A1E]/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-md transition"
              tabIndex={-1}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Thanh gợi ý tài khoản thử nghiệm (Demo Quick Fill) */}
        {currentPortal === "MANAGEMENT" && (
          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-medium">Điền nhanh tài khoản kiểm thử:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "Admin@123")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-2xs transition hover:bg-stone-100 hover:border-stone-300 cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Quản trị viên (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("staff", "Staff@123")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-2xs transition hover:bg-stone-100 hover:border-stone-300 cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Thủ thư (Staff)
              </button>
            </div>
          </div>
        )}

        {/* Nút Đăng nhập */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-semibold text-white transition duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-md ${
            currentPortal === "MEMBER"
              ? "bg-gradient-to-r from-[#8A5A1E] to-[#6b4213] hover:from-[#764b18] hover:to-[#5c370e] shadow-[#8A5A1E]/20"
              : "bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#12192B] hover:opacity-95 text-amber-200 shadow-stone-900/20"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xác thực đăng nhập...</span>
            </>
          ) : currentPortal === "MEMBER" ? (
            "Đăng nhập Bạn đọc"
          ) : (
            "Đăng nhập Ban quản lý"
          )}
        </button>

        {/* Liên kết Đăng ký hoặc Ghi chú Quản trị */}
        {currentPortal === "MEMBER" ? (
          <div className="pt-2 text-center text-sm text-stone-600">
            Chưa có tài khoản độc giả?{" "}
            <a
              href="/register"
              className="font-semibold text-[#8A5A1E] hover:text-[#724814] hover:underline"
            >
              Đăng ký tài khoản ngay
            </a>
          </div>
        ) : (
          <div className="rounded-xl bg-stone-100/70 p-2.5 text-center text-xs text-stone-600 border border-stone-200/60 leading-relaxed">
            ✦ Tài khoản nhân viên và quản trị viên do Quản trị hệ thống cấp phát nội bộ.
          </div>
        )}
      </form>

      {/* =====================================================
          Modal Quên mật khẩu (100% Tiếng Việt)
          ===================================================== */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={closeForgotPassword}
              className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2b1608] text-amber-300 shadow-sm">
                <Mail className="h-5 w-5" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2b1608]">
                Khôi phục mật khẩu
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Nhập địa chỉ email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Địa chỉ Email
              </label>

              <input
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="vidu@thuviensach.vn"
                className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8A5A1E] focus:ring-2 focus:ring-[#8A5A1E]/20"
              />
            </div>

            {forgotMessage && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 leading-relaxed">
                {forgotMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForgotPassword}
                disabled={forgotLoading}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="flex items-center gap-2 rounded-xl bg-[#8A5A1E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#724814] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi liên kết khôi phục"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Modal Đặt lại mật khẩu (100% Tiếng Việt)
          ===================================================== */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={closeResetPassword}
              disabled={resetLoading}
              className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-700 disabled:opacity-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2b1608] text-amber-300 shadow-sm">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2b1608]">
                Đặt lại mật khẩu mới
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn bên dưới.
              </p>
            </div>

            <div className="space-y-4">
              {/* Mật khẩu mới */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Mật khẩu mới
                </label>

                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(event) =>
                    setResetPasswordValue(event.target.value)
                  }
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8A5A1E] focus:ring-2 focus:ring-[#8A5A1E]/20"
                />
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Xác nhận mật khẩu mới
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8A5A1E] focus:ring-2 focus:ring-[#8A5A1E]/20"
                />
              </div>
            </div>

            {resetError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {resetMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeResetPassword}
                disabled={resetLoading}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="flex items-center gap-2 rounded-xl bg-[#8A5A1E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#724814] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  "Lưu mật khẩu mới"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
