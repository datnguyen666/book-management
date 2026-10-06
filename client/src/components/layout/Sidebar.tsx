import { useEffect, useState } from "react";
import {
  BookOpen,
  BookUser,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  User,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  /** Chỉ active khi đường dẫn khớp chính xác (không khớp route con) */
  end?: boolean;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    label: "Tổng quan",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Quản lý",
    items: [
      { label: "Categories", path: "/categories", icon: FolderOpen },
      { label: "Books", path: "/books", icon: BookOpen },
      { label: "Staff", path: "/staff", icon: User, adminOnly: true },
    ],
  },
  {
    label: "Hoạt động",
    items: [{ label: "Borrow Records", path: "/borrows", icon: BookUser }],
  },
];

const profileLinks = [
  { label: "Thông tin cá nhân", path: "/profile", end: true },
  { label: "Cập nhật hồ sơ", path: "/profile/edit", end: false },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/60";

/* ------------------------------------------------------------------ */
/* Sub components                                                      */
/* ------------------------------------------------------------------ */

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 px-3 text-xs font-medium text-[#8B97B0]">{children}</p>
  );
}

function IconChip({
  icon: Icon,
  active,
}: {
  icon: NavigationItem["icon"];
  active: boolean;
}) {
  return (
    <span
      className={[
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[#C89B3C]/15 text-[#E0AE55]"
          : "text-slate-400 group-hover:text-slate-200",
      ].join(" ")}
    >
      <Icon size={16} />
    </span>
  );
}

function ActiveBar() {
  return (
    <span
      aria-hidden
      className="absolute -left-3 bottom-2 top-2 w-[3px] rounded-r-full bg-[#C89B3C]"
    />
  );
}

function NavItem({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          FOCUS_RING,
          isActive
            ? "bg-white/[0.07] text-white"
            : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <ActiveBar />}
          <IconChip icon={item.icon} active={isActive} />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SubNavItem({
  label,
  path,
  end,
  focusable,
  onNavigate,
}: {
  label: string;
  path: string;
  end: boolean;
  focusable: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={path}
      end={end}
      tabIndex={focusable ? 0 : -1}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
          FOCUS_RING,
          isActive
            ? "bg-white/[0.06] text-white"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className="absolute -left-[13px] bottom-2 top-2 w-[2px] rounded-full bg-[#C89B3C]"
            />
          )}
          <span
            aria-hidden
            className={[
              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
              isActive
                ? "bg-[#E0AE55]"
                : "bg-slate-600 group-hover:bg-slate-400",
            ].join(" ")}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const isProfileRoute = location.pathname.startsWith("/profile");
  const [isPersonalOpen, setIsPersonalOpen] = useState(isProfileRoute);

  useEffect(() => {
    if (isProfileRoute) setIsPersonalOpen(true);
  }, [isProfileRoute]);

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.adminOnly ? user?.role === "ADMIN" : true,
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {isOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-[#12192B] text-white",
          "shadow-2xl transition-transform duration-300 ease-in-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:shadow-none",
        ].join(" ")}
      >
        {/* Gold spine */}
        <div className="h-[3px] w-full shrink-0 bg-[#B8863B]" />

        {/* Brand — cao 70px (3 + 67) để thẳng hàng với header chính */}
        <div className="flex h-[67px] shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#B8863B]/50 bg-[#B8863B]/10">
              <BookOpen size={17} className="text-[#E0AE55]" />
            </div>

            <div className="min-w-0 leading-tight">
              <h1 className="truncate font-['Source_Serif_4',serif] text-[17px] font-semibold tracking-tight">
                Book Management
              </h1>
              <p className="truncate text-[11px] text-[#8B97B0]">
                Quản lý thư viện
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng menu"
            onClick={onClose}
            className={[
              "shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-white lg:hidden",
              FOCUS_RING,
            ].join(" ")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Điều hướng chính"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-6"
        >
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <GroupLabel>{group.label}</GroupLabel>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.path} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}

          {/* Tài khoản */}
          <div>
            <GroupLabel>Tài khoản</GroupLabel>

            <button
              type="button"
              aria-expanded={isPersonalOpen}
              aria-controls="personal-submenu"
              onClick={() => setIsPersonalOpen((current) => !current)}
              className={[
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                isProfileRoute
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
              ].join(" ")}
            >
              {isProfileRoute && <ActiveBar />}
              <IconChip icon={User} active={isProfileRoute} />
              <span className="flex-1 truncate text-left">Cá nhân</span>
              <ChevronDown
                size={15}
                aria-hidden
                className={[
                  "shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none",
                  isPersonalOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {/* Mở/đóng mượt bằng grid-rows, không cần biết trước chiều cao */}
            <div
              id="personal-submenu"
              aria-hidden={!isPersonalOpen}
              className={[
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                isPersonalOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className="relative ml-[26px] mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {profileLinks.map((link) => (
                    <SubNavItem
                      key={link.path}
                      {...link}
                      focusable={isPersonalOpen}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
