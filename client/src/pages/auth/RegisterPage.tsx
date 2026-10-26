import { RegisterForm } from "@/components/auth/RegisterForm";
import { BookOpen } from "lucide-react";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2b1608] via-[#1f0f05] to-[#160a03] p-12 text-white lg:flex">
        {/* subtle dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] text-amber-100/90">
            DIGITAL LIBRARY
          </span>
        </div>

        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-amber-400">✦</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight">
            Gia nhập thư viện,
            <br />
            <span className="text-amber-400">mở ra tri thức.</span>
          </h1>
          <p className="mb-8 max-w-sm text-white/60">
            Đăng ký tài khoản độc giả miễn phí để tra cứu, gửi yêu cầu mượn sách trực tuyến và quản lý lịch sử đọc sách của bạn.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border-l-2 border-amber-500 bg-white/5 p-4">
              <p className="text-sm font-semibold text-amber-200">
                ✦ Mượn sách trực tuyến thuận tiện
              </p>
              <p className="mt-1 text-xs text-white/50">
                Khám phá hàng ngàn đầu sách phong phú và đặt mượn dễ dàng chỉ với một thao tác.
              </p>
            </div>
            <div className="rounded-lg border-l-2 border-amber-500 bg-white/5 p-4">
              <p className="text-sm font-semibold text-amber-200">
                ✦ Tự động cấp Mã độc giả cá nhân
              </p>
              <p className="mt-1 text-xs text-white/50">
                Sử dụng mã độc giả để giao nhận sách nhanh chóng tại quầy thư viện.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Digital Library. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f5f1ea] px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="mb-2 font-serif text-3xl font-bold text-[#2b1608]">
            Đăng ký độc giả
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Tạo tài khoản để bắt đầu mượn sách từ thư viện
          </p>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#e8e1d8" }} />
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="#c9a87a"
              opacity="0.5"
            >
              <rect
                x="3"
                y="0"
                width="4"
                height="4"
                transform="rotate(45 5 2)"
              />
            </svg>
            <div className="h-px flex-1" style={{ background: "#e8e1d8" }} />
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
