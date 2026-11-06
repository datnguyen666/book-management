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
    <div
      className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#eae4d9]/70 p-1.5 border border-stone-200/80"
      role="tablist"
      aria-label="Cổng đăng nhập"
    >
      {/* Cổng Bạn đọc */}
      <button
        type="button"
        role="tab"
        aria-selected={isMember}
        disabled={disabled}
        onClick={() => onChange("MEMBER")}
        className={`group relative flex items-center gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 cursor-pointer ${
          isMember
            ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-950/5"
            : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isMember
              ? "bg-[#8A5A1E] text-white shadow-xs"
              : "bg-stone-200/80 text-stone-500 group-hover:bg-amber-100/60 group-hover:text-amber-900"
          }`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight">Bạn đọc</span>
            {isMember && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#8A5A1E] text-[9px] text-white font-bold">
                ✓
              </span>
            )}
          </div>
          <p className="truncate text-xs text-stone-500 font-medium">
            Mượn & tra cứu
          </p>
        </div>
      </button>

      {/* Cổng Quản lý & Thủ thư */}
      <button
        type="button"
        role="tab"
        aria-selected={isManagement}
        disabled={disabled}
        onClick={() => onChange("MANAGEMENT")}
        className={`group relative flex items-center gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 cursor-pointer ${
          isManagement
            ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-950/5"
            : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isManagement
              ? "bg-[#1c1917] text-amber-300 shadow-xs"
              : "bg-stone-200/80 text-stone-500 group-hover:bg-stone-300/80 group-hover:text-stone-900"
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight">Quản lý</span>
            {isManagement && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1c1917] text-[9px] text-amber-300 font-bold">
                ✓
              </span>
            )}
          </div>
          <p className="truncate text-xs text-stone-500 font-medium">
            Thủ thư & Admin
          </p>
        </div>
      </button>
    </div>
  );
}
