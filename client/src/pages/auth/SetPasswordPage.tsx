import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";

import { setPassword } from "@/api/auth.api";

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);

    if (!token) {
      setError("Đường dẫn thiết lập mật khẩu không hợp lệ hoặc thiếu mã xác thực.");
      return;
    }

    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu tạm thời nhận từ email.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);

      await setPassword({
        token,
        currentPassword,
        password,
      });

      alert("Thiết lập mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");

      navigate("/login");
    } catch (err) {
      console.error(err);

      setError(
        "Mật khẩu tạm thời không chính xác, hoặc đường dẫn thiết lập đã hết hạn sử dụng.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#f5f1ea] px-6 py-12">
      <div className="my-auto w-full max-w-md">
        {/* Branding Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b1608] to-[#160a03] text-amber-300 shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="font-semibold tracking-[0.2em] text-[#2b1608] text-sm uppercase">
            Digital Library
          </h2>
          <p className="text-xs text-amber-900/60 font-medium mt-0.5">
            Welcome Portal
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl bg-white p-8 shadow-xl border border-stone-200/80">
          <h1 className="font-serif text-2xl font-bold text-[#2b1608]">
            Thiết lập mật khẩu
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Khởi tạo mật khẩu mới cho tài khoản nhân viên của bạn.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Mật khẩu tạm thời
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 pr-11 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  placeholder="Nhập mật khẩu tạm thời từ email"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Mật khẩu mới
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 pr-11 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Xác nhận mật khẩu mới
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 pr-11 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  placeholder="Nhập lại mật khẩu mới"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#2b1608] to-[#44403c] p-3 text-sm font-semibold text-amber-300 transition hover:bg-black hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? "Đang thiết lập mật khẩu..." : "Xác nhận thiết lập mật khẩu"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-amber-800 hover:underline"
            >
              ← Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Digital Library. All rights reserved.
      </footer>
    </div>
  );
}
