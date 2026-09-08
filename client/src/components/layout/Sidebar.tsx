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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400/10">
              <BookOpen size={17} className="text-amber-400" />
            </div>
            <h1 className="truncate text-lg font-bold">Book Management</h1>
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
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-medium text-slate-500">
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
                          "group flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5",
                          "text-sm font-medium transition-colors",
                          isActive
                            ? "border-amber-400 bg-amber-400/10 text-white"
                            : "border-transparent text-slate-400 hover:bg-slate-900 hover:text-white",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={17}
                            className={
                              isActive
                                ? "text-amber-400"
                                : "text-slate-500 group-hover:text-slate-300"
                            }
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
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-400">
              {initials || <User size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.fullName ?? "—"}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
