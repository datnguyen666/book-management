import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X, Mail, LockKeyhole, AlertCircle } from "lucide-react";
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

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);

  const [forgotMessage, setForgotMessage] = useState("");

  const [resetPasswordValue, setResetPasswordValue] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetLoading, setResetLoading] = useState(false);

  const [resetMessage, setResetMessage] = useState("");

  const [resetError, setResetError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const resetToken = searchParams.get("resetToken");

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

  // Open reset password modal automatically
  // when coming from email reset link.
  useEffect(() => {
    if (resetToken) {
      setShowResetPassword(true);
      setResetMessage("");
      setResetError("");
    }
  }, [resetToken]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");
    try {
      // 1. Login with portal
      const loginResponse = await login({
        username: data.username,
        password: data.password,
        portal: currentPortal,
      });

      // 2. Save JWT
      setAccessToken(loginResponse.accessToken);

      // 3. Get profile
      const profile = await getProfile();

      // 4. Save user
      setUser(profile);

      // 5. Navigate based on role
      if (profile.role === "MEMBER") {
        navigate("/books");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      const serverMessage = error?.response?.data?.message;
      if (typeof serverMessage === "string" && serverMessage.trim()) {
        setLoginError(serverMessage);
      } else if (Array.isArray(serverMessage) && serverMessage.length > 0) {
        setLoginError(serverMessage[0]);
      } else {
        setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");

    if (!forgotEmail.trim()) {
      setForgotMessage("Please enter your email.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await forgotPassword({
        email: forgotEmail.trim(),
      });

      setForgotMessage(response.message);
    } catch (error) {
      console.error(error);

      // Always show generic message
      setForgotMessage("Please check your email");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetMessage("");
    setResetError("");

    if (!resetToken) {
      setResetError("Invalid or missing password reset token.");
      return;
    }

    if (resetPasswordValue.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    if (resetPasswordValue !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);

    try {
      const response = await resetPassword({
        token: resetToken,
        password: resetPasswordValue,
      });

      setResetMessage(response.message);

      setResetPasswordValue("");
      setConfirmPassword("");

      // Remove token from URL
      setSearchParams({});

      // Close modal after successful reset
      setTimeout(() => {
        setShowResetPassword(false);
        setResetMessage("");
        setResetError("");
      }, 1200);
    } catch (error) {
      console.error(error);

      setResetError("Invalid or expired password reset link.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    if (forgotLoading) {
      return;
    }

    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotMessage("");
  };

  const closeResetPassword = () => {
    if (resetLoading) {
      return;
    }

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Visual Error Banner */}
        {loginError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
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

        {/* Username */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Tên đăng nhập
          </label>

          <input
            {...register("username")}
            type="text"
            placeholder={
              currentPortal === "MEMBER"
                ? "Nhập tên đăng nhập độc giả"
                : "Nhập tài khoản thủ thư / quản trị"
            }
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />

          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Mật khẩu
          </label>

          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-lg border border-gray-200 bg-white p-3 pr-11 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(true);
              setForgotMessage("");
            }}
            className="text-sm text-amber-700 hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-lg p-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm ${
            currentPortal === "MEMBER"
              ? "bg-gradient-to-r from-[#3b2410] to-[#7a4b1e]"
              : "bg-gradient-to-r from-[#1c1917] to-[#44403c]"
          }`}
        >
          {isSubmitting
            ? "Đang đăng nhập..."
            : currentPortal === "MEMBER"
            ? "Đăng nhập Bạn đọc"
            : "Đăng nhập Ban quản lý"}
        </button>

        {/* Register link / Management note */}
        {currentPortal === "MEMBER" ? (
          <div className="pt-2 text-center text-sm text-gray-600">
            Chưa có tài khoản độc giả?{" "}
            <a
              href="/register"
              className="font-medium text-[#7a4b1e] hover:underline"
            >
              Đăng ký ngay
            </a>
          </div>
        ) : (
          <div className="rounded-lg bg-stone-100/70 p-2.5 text-center text-xs text-stone-600 border border-stone-200/60">
            ✦ Tài khoản nhân viên và quản trị viên do Quản trị hệ thống cấp phát nội bộ.
          </div>
        )}
      </form>

      {/* =====================================================
          Forgot Password Modal
          ===================================================== */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeForgotPassword}
              className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-[#d4a853]">
                <Mail className="h-5 w-5" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Forgot password?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter your email address and we'll send you a password reset
                link.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Email
              </label>

              <input
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            {forgotMessage && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {forgotMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForgotPassword}
                disabled={forgotLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="rounded-lg bg-[#7a4b1e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {forgotLoading ? "Sending..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Reset Password Modal
          ===================================================== */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeResetPassword}
              disabled={resetLoading}
              className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-[#d4a853]">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Reset password
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  New Password
                </label>

                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(event) =>
                    setResetPasswordValue(event.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {resetError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {resetMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeResetPassword}
                disabled={resetLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="rounded-lg bg-[#7a4b1e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
