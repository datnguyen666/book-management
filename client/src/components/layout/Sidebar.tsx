import { useEffect, useState } from "react";
import {
  BookOpen,
  BookUser,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Users,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { getAppBranding } from "@/utils/branding";
import type { Role } from "@/types/auth";

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

const staffNavigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { label: "Categories", path: "/categories", icon: FolderOpen },
      { label: "Books", path: "/books", icon: BookOpen },
      { label: "Staff", path: "/staff", icon: User, adminOnly: true },
      { label: "Members", path: "/members", icon: Users },
    ],
  },
  {
    label: "Circulation",
    items: [{ label: "Loans & Returns", path: "/borrows", icon: BookUser }],
  },
];

const memberNavigationGroups: NavigationGroup[] = [
  {
    label: "Discovery",
    items: [{ label: "Search Books", path: "/books", icon: BookOpen }],
  },
  {
    label: "My Library",
    items: [{ label: "Reading List", path: "/my-borrows", icon: BookUser }],
  },
];

const profileLinks = [
  { label: "Profile", path: "/profile", end: true },
  { label: "Update Profile", path: "/profile/edit", end: false },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/60";

/* ------------------------------------------------------------------ */
/* Sub components                                                      */
/* ------------------------------------------------------------------ */

function SectionLabel({
  children,
  collapsed,
}: {
  children: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return <div className="mx-2 my-2 h-px bg-white/[0.07]" />;
  }
  return (
    <div className="mb-1.5 flex items-center gap-2 px-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function Tooltip({
  label,
  children,
  enabled,
}: {
  label: string;
  children: React.ReactNode;
  enabled: boolean;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className="group/tip relative">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2
                   whitespace-nowrap rounded-md bg-[#1E2D3D] px-2.5 py-1.5 text-xs font-medium
                   text-white shadow-lg ring-1 ring-white/10
                   opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {label}
        <span
          className="absolute right-full top-1/2 -translate-y-1/2
                     border-4 border-transparent border-r-[#1E2D3D]"
        />
      </div>
    </div>
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
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200",
        active
          ? "bg-[#C89B3C]/25 text-[#E0AE55]"
          : "text-slate-400 group-hover:bg-white/[0.07] group-hover:text-slate-200",
      ].join(" ")}
    >
      <Icon size={16} />
    </span>
  );
}

function NavItem({
  item,
  onNavigate,
  collapsed,
}: {
  item: NavigationItem;
  onNavigate: () => void;
  collapsed: boolean;
}) {
  return (
    <Tooltip label={item.label} enabled={collapsed}>
      <NavLink
        to={item.path}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            "group relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-all duration-150",
            FOCUS_RING,
            collapsed ? "justify-center px-2" : "px-2",
            isActive
              ? "bg-[#C89B3C]/[0.12] text-white ring-1 ring-inset ring-[#C89B3C]/20"
              : "text-slate-300/90 hover:bg-white/[0.05] hover:text-white",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <span
                aria-hidden
                className="absolute -left-1 bottom-1.5 top-1.5 w-[3px] rounded-r-full bg-[#C89B3C]"
              />
            )}
            <IconChip icon={item.icon} active={isActive} />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </>
        )}
      </NavLink>
    </Tooltip>
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
          "group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          FOCUS_RING,
          isActive
            ? "bg-[#C89B3C]/[0.08] text-white"
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
/* Role badge config                                                   */
/* ------------------------------------------------------------------ */

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20",
  },
  STAFF: {
    label: "Staff",
    className: "bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20",
  },
  MEMBER: {
    label: "Member",
    className: "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20",
  },
};

/* ------------------------------------------------------------------ */
/* SidebarUserCard                                                     */
/* ------------------------------------------------------------------ */

function SidebarUserCard({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const user = useAuthStore((state) => state.user);

  const initials =
    user?.fullName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  const badge = ROLE_BADGE[user?.role ?? "MEMBER"];

  if (collapsed) {
    return (
      <div className="shrink-0 border-t border-white/[0.08] px-2 py-3">
        <Tooltip label={user?.fullName ?? "Account"} enabled>
          <NavLink
            to="/profile"
            onClick={onNavigate}
            className="flex items-center justify-center rounded-lg p-1 transition-colors hover:bg-white/[0.06]"
          >
            <div
              className="h-7 w-7 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#8A5A1E]
                         flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            >
              {initials}
            </div>
          </NavLink>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-white/[0.08] px-3 py-3">
      <NavLink
        to="/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            "group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-150",
            isActive
              ? "bg-[#C89B3C]/[0.10] ring-1 ring-inset ring-[#C89B3C]/20"
              : "hover:bg-white/[0.05]",
          ].join(" ")
        }
      >
        {/* Avatar with online dot */}
        <div className="relative shrink-0">
          <div
            className="h-8 w-8 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#8A5A1E]
                       flex items-center justify-center text-xs font-bold text-white select-none"
          >
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                       bg-emerald-500 ring-2 ring-[#0F1623]"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white">
            {user?.fullName ?? "—"}
          </p>
          <span
            className={`mt-0.5 inline-flex items-center rounded px-1.5 py-px text-[10px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </NavLink>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const branding = getAppBranding(user?.role);

  const isProfileRoute = location.pathname.startsWith("/profile");
  const [isPersonalOpen, setIsPersonalOpen] = useState(isProfileRoute);

  useEffect(() => {
    if (isProfileRoute) setIsPersonalOpen(true);
  }, [isProfileRoute]);

  const isMember = user?.role === "MEMBER";
  const activeNavigationGroups = isMember
    ? memberNavigationGroups
    : staffNavigationGroups;

  const visibleGroups = activeNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.adminOnly ? user?.role === "ADMIN" : true,
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleNavigate = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[#0F1623] text-white",
          "shadow-2xl transition-all duration-300 ease-in-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "w-[68px]" : "w-64",
        ].join(" ")}
      >
        {/* Gold top spine — gradient */}
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-[#8A5A1E] via-[#C89B3C] to-[#8A5A1E]" />

        {/* Brand header */}
        <div
          className={[
            "flex h-[67px] shrink-0 items-center border-b border-white/[0.07]",
            isCollapsed
              ? "flex-col justify-center gap-1.5 px-2"
              : "justify-between gap-2 px-4",
          ].join(" ")}
        >
          {/* Logo + text */}
          <div
            className={[
              "flex min-w-0 items-center gap-3",
              isCollapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                         border border-[#B8863B]/40 bg-[#B8863B]/10"
            >
              <BookOpen size={15} className="text-[#E0AE55]" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-[15px] font-bold tracking-tight text-white">
                  {branding.title}
                </h1>
                <p className="truncate text-[11px] text-slate-500">
                  {branding.subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Right side — close (mobile) + collapse (desktop) */}
          <div
            className={[
              "flex shrink-0 items-center",
              isCollapsed ? "justify-center" : "gap-1",
            ].join(" ")}
          >
            {/* Mobile close — only shown in expanded mode */}
            {!isCollapsed && (
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={onClose}
                className={[
                  "rounded-md p-1 text-slate-500 transition-colors hover:text-white lg:hidden",
                  FOCUS_RING,
                ].join(" ")}
              >
                <X size={18} />
              </button>
            )}

            {/* Desktop collapse toggle */}
            <Tooltip
              label={isCollapsed ? "Mở rộng" : "Thu gọn"}
              enabled={isCollapsed}
            >
              <button
                type="button"
                aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                onClick={onToggleCollapse}
                className={[
                  "hidden rounded-md p-1.5 text-slate-500 transition-colors",
                  "hover:bg-white/[0.07] hover:text-slate-200 lg:flex",
                  FOCUS_RING,
                ].join(" ")}
              >
                {isCollapsed ? (
                  <PanelLeftOpen size={15} />
                ) : (
                  <PanelLeftClose size={15} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Điều hướng chính"
          className={[
            "flex-1 overflow-y-auto overflow-x-hidden py-4",
            isCollapsed ? "space-y-0 px-2" : "space-y-5 px-3",
          ].join(" ")}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(200,155,60,0.2) transparent",
          }}
        >
          {visibleGroups.map((group) => (
            <div key={group.label} className={isCollapsed ? "space-y-1" : ""}>
              <SectionLabel collapsed={isCollapsed}>
                {group.label}
              </SectionLabel>
              <div className={isCollapsed ? "space-y-1" : "space-y-0.5"}>
                {group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    onNavigate={handleNavigate}
                    collapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Account section — hidden when collapsed (falls into User Card) */}
          {!isCollapsed && (
            <div>
              <SectionLabel collapsed={false}>Account</SectionLabel>

              <button
                type="button"
                aria-expanded={isPersonalOpen}
                aria-controls="personal-submenu"
                onClick={() => setIsPersonalOpen((v) => !v)}
                className={[
                  "group relative flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150",
                  FOCUS_RING,
                  isProfileRoute
                    ? "bg-[#C89B3C]/[0.12] text-white ring-1 ring-inset ring-[#C89B3C]/20"
                    : "text-slate-300/90 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")}
              >
                {isProfileRoute && (
                  <span
                    aria-hidden
                    className="absolute -left-1 bottom-1.5 top-1.5 w-[3px] rounded-r-full bg-[#C89B3C]"
                  />
                )}
                <IconChip icon={User} active={isProfileRoute} />
                <span className="flex-1 truncate text-left">
                  Account Settings
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden
                  className={[
                    "shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none",
                    isPersonalOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {/* Sub-menu — grid trick for smooth height animation */}
              <div
                id="personal-submenu"
                aria-hidden={!isPersonalOpen}
                className={[
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                  isPersonalOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <div className="relative ml-[26px] mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                    {profileLinks.map((link) => (
                      <SubNavItem
                        key={link.path}
                        {...link}
                        focusable={isPersonalOpen}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User card footer */}
        <SidebarUserCard
          collapsed={isCollapsed}
          onNavigate={handleNavigate}
        />
      </aside>
    </>
  );
}
