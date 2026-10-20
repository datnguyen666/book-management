import { BookOpen, ShieldCheck } from "lucide-react";
import type { LoginPortal } from "@/types/auth";

interface PortalSelectorProps {
  portal: LoginPortal;
  onChange: (portal: LoginPortal) => void;
  disabled?: boolean;
}

export function PortalSelector({
  portal,
  onChange,
  disabled = false,
}: PortalSelectorProps) {
  const isMember = portal === "MEMBER";
  const isManagement = portal === "MANAGEMENT";

  return (
    <div className="mb-6 grid grid-cols-2 gap-3" role="tablist" aria-label="Cổng đăng nhập">
      {/* Cổng Bạn đọc */}
      <button
        type="button"
        role="tab"
        aria-selected={isMember}
        disabled={disabled}
        onClick={() => onChange("MEMBER")}
        className={`group relative flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all duration-200 cursor-pointer ${
          isMember
            ? "border-[#8A5A1E] bg-amber-50/70 shadow-sm ring-2 ring-[#8A5A1E]/20 text-[#3b2410]"
            : "border-gray-200 bg-white text-gray-500 hover:border-amber-200 hover:bg-amber-50/20"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <div
          className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isMember
              ? "bg-[#8A5A1E] text-white shadow-sm"
              : "bg-gray-100 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-800"
          }`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900">
          Bạn đọc
        </span>
        <span className="mt-0.5 text-[11px] text-gray-500 font-medium">
          Mượn & tra cứu sách
        </span>

        {isMember && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8A5A1E] text-[10px] text-white">
            ✓
          </span>
        )}
      </button>

      {/* Cổng Quản lý & Nhân viên */}
      <button
        type="button"
        role="tab"
        aria-selected={isManagement}
        disabled={disabled}
        onClick={() => onChange("MANAGEMENT")}
        className={`group relative flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all duration-200 cursor-pointer ${
          isManagement
            ? "border-[#2b1608] bg-stone-100/90 shadow-sm ring-2 ring-[#2b1608]/20 text-[#2b1608]"
            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-stone-50/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <div
          className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isManagement
              ? "bg-[#2b1608] text-amber-300 shadow-sm"
              : "bg-gray-100 text-gray-400 group-hover:bg-stone-200 group-hover:text-stone-800"
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900">
          Ban quản lý
        </span>
        <span className="mt-0.5 text-[11px] text-gray-500 font-medium">
          Thủ thư & Quản trị
        </span>

        {isManagement && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2b1608] text-[10px] text-amber-300">
            ✓
          </span>
        )}
      </button>
    </div>
  );
}
