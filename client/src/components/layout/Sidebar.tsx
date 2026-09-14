import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  User,
  BookUser,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.adminOnly ? user?.role === "ADMIN" : true,
      ),
    }))
    .filter((group) => group.items.length > 0);

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col text-white",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
        style={{ backgroundColor: "#12192B" }}
      >
        {/* Spine accent */}
        <div
          className="h-[3px] w-full"
          style={{ backgroundColor: "#B8863B" }}
        />

        {/* Logo */}
        <div
          className="flex items-center justify-between gap-2 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(184,134,59,0.18)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ border: "1px solid #B8863B" }}
            >
              <BookOpen size={15} style={{ color: "#B8863B" }} />
            </div>
            <h1
              className="truncate text-[17px] font-semibold tracking-tight"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              Book Management
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-7">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p
                className="mb-2.5 px-3 text-[11px] font-medium"
                style={{ color: "#5C6B85", letterSpacing: "0.02em" }}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "group relative flex items-center gap-3 rounded-md px-3 py-2.5 pl-4",
                          "text-sm font-medium transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200",
                        ].join(" ")
                      }
                      style={({ isActive }) => ({
                        backgroundColor: isActive
                          ? "rgba(184,134,59,0.10)"
                          : "transparent",
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2"
                              style={{ backgroundColor: "#B8863B" }}
                            />
                          )}
                          <Icon
                            size={16}
                            className={
                              isActive ? "" : "group-hover:text-slate-300"
                            }
                            style={{ color: isActive ? "#C89B3C" : undefined }}
                          />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(184,134,59,0.18)" }}
        >
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(184,134,59,0.12)",
                color: "#C89B3C",
                border: "1px solid rgba(184,134,59,0.35)",
              }}
            >
              {initials || <User size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.fullName ?? "—"}
              </p>
              <p className="truncate text-xs" style={{ color: "#5C6B85" }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
