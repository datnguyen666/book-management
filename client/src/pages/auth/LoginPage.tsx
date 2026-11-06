import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  BookOpen,
  Library,
  BookMarked,
  Clock,
  Layers,
  FileCheck2,
  BarChart3,
  Sparkles,
} from "lucide-react";
import type { LoginPortal } from "@/types/auth";

export function LoginPage() {
  const [portal, setPortal] = useState<LoginPortal>("MEMBER");

  const isMember = portal === "MEMBER";

  return (
    <div className="flex min-h-screen">
      {/* ========================================================
          Left Panel: Showcase (Desktop lg+)
          ======================================================== */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2b1608] via-[#1a0e05] to-[#120903] p-12 text-white lg:flex">
        {/* Subtle dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Ambient warm glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-[0.2em] text-amber-100/90 uppercase">
              Thư Viện Số
            </span>
            <span className="block text-[11px] font-medium tracking-wider text-amber-300/70 uppercase">
              Hệ thống Quản lý Thư viện
            </span>
          </div>
        </div>

        {/* Dynamic Showcase Content */}
        <div className="relative z-10 max-w-lg transition-all duration-300">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/30" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300">
              <Sparkles className="h-3 w-3" />
              {isMember ? "DÀNH CHO ĐỘC GIẢ" : "DÀNH CHO BAN QUẢN LÝ"}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/30" />
          </div>

          {isMember ? (
            <>
              <h1 className="mb-4 font-serif text-4xl font-bold leading-tight">
                Kho tàng tri thức,
                <br />
                <span className="text-amber-400">trong tầm tay bạn.</span>
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-stone-300/80">
                Khám phá hàng ngàn đầu sách chọn lọc, đặt mượn trực tuyến thuận tiện và quản lý tiến trình đọc sách của bạn trong không gian số hiện đại.
              </p>

              <div className="space-y-3">
                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Kho sách phong phú & đa dạng
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Tra cứu tức thì theo tên sách, tác giả, nhà xuất bản và danh mục yêu thích.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <Library className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Đặt mượn & nhận sách nhanh chóng
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Gửi yêu cầu mượn trực tuyến, giao nhận sách thuận tiện với Mã độc giả cá nhân.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Theo dõi hạn trả & Gia hạn sách
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Kiểm soát hạn mượn rõ ràng, chủ động gia hạn sách trực tuyến mà không lo trễ hạn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-4 font-serif text-4xl font-bold leading-tight">
                Vận hành chuyên nghiệp,
                <br />
                <span className="text-amber-400">kiểm soát toàn diện.</span>
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-stone-300/80">
                Hệ thống số hóa quy trình quản trị thư viện toàn diện: kiểm soát kho sách, xét duyệt mượn trả tự động và báo cáo định lượng tài sản chính xác.
              </p>

              <div className="space-y-3">
                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Kiểm kê kho & Phân loại danh mục
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Theo dõi số lượng nhập, sách đang mượn và số lượng khả dụng theo thời gian thực.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Duyệt mượn trả & Cảnh báo quá hạn
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Xử lý phiếu mượn/trả trong vài thao tác, quản lý hạn trả và hạn chế thất thoát sách.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:border-amber-400/40 hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Báo cáo & Thống kê tài sản thư viện
                      </p>
                      <p className="mt-0.5 text-xs text-stone-300/70">
                        Định giá tổng tài sản kho sách, hỗ trợ xuất báo cáo tổng quan dạng Excel và PDF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-stone-400/80">
          © {new Date().getFullYear()} Thư Viện Số. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* ========================================================
          Right Panel: Login Form (Responsive)
          ======================================================== */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f6f3ee] px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Branding Header (< lg) */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b1608] to-[#120903] text-amber-300 shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="font-semibold tracking-[0.2em] text-[#2b1608] text-sm uppercase">
              Thư Viện Số
            </h2>
            <p className="text-xs text-amber-900/70 font-medium mt-0.5">
              Hệ thống Quản lý Thư viện
            </p>
          </div>

          {/* Form Header */}
          <div className="text-center sm:text-left">
            <h2 className="font-serif text-3xl font-bold text-[#2b1608]">
              {isMember ? "Chào mừng Bạn đọc" : "Cổng Quản trị Thư viện"}
            </h2>
            <p className="mt-1.5 text-sm text-stone-600">
              {isMember
                ? "Đăng nhập để tra cứu, đặt mượn và quản lý sách của bạn"
                : "Đăng nhập dành cho Thủ thư và Quản trị viên hệ thống"}
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="mt-4 mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-300/70" />
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="#c9a87a"
              opacity="0.7"
            >
              <rect
                x="3"
                y="0"
                width="4"
                height="4"
                transform="rotate(45 5 2)"
              />
            </svg>
            <div className="h-px flex-1 bg-stone-300/70" />
          </div>

          {/* Form Component */}
          <LoginForm portal={portal} onPortalChange={setPortal} />

          {/* Mobile Footer */}
          <footer className="mt-8 text-center text-xs text-stone-400 lg:hidden">
            © {new Date().getFullYear()} Thư Viện Số. Bảo lưu mọi quyền.
          </footer>
        </div>
      </div>
    </div>
  );
}
