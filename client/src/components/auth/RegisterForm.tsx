import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/register.schema";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{
    memberCode: string;
    fullName: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");

    try {
      const response = await registerUser({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });

      setAccessToken(response.accessToken);
      setUser(response.user);

      setSuccessInfo({
        memberCode: response.user.memberCode || "",
        fullName: response.user.fullName,
      });

      // Chuyển hướng sau 2 giây để người dùng nhìn thấy Mã Độc Giả của mình
      setTimeout(() => {
        navigate("/books");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setServerError(msg);
    }
  };

  if (successInfo) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/80 p-6 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 font-serif">
          Đăng ký thành công!
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Chào mừng độc giả <span className="font-semibold">{successInfo.fullName}</span>
        </p>

        <div className="my-5 rounded-lg border border-dashed border-[#B8863B] bg-amber-50 p-3">
          <p className="text-xs uppercase tracking-wider text-amber-800">
            Mã độc giả của bạn
          </p>
          <p className="mt-1 text-2xl font-mono font-bold text-[#8A5A1E]">
            {successInfo.memberCode}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Đang chuyển hướng bạn đến thư viện sách...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Họ và tên
        </label>
        <input
          {...register("fullName")}
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A"
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Tên đăng nhập
        </label>
        <input
          {...register("username")}
          type="text"
          placeholder="Ví dụ: nguyenvana"
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="nguyenvana@gmail.com"
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Số điện thoại (tùy chọn)
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="0912345678"
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pr-10 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pr-10 text-sm outline-none transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-[#3b2410] to-[#7a4b1e] p-3 font-semibold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký độc giả"}
      </button>

      <div className="pt-2 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-medium text-[#7a4b1e] hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
