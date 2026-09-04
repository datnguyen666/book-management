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

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FolderOpen,
  },
  {
    label: "Books",
    path: "/books",
    icon: BookOpen,
  },
  {
    label: "Staff",
    path: "/staff",
    icon: User,
    adminOnly: true,
  },
  {
    label: "Borrow Records",
    path: "/borrows",
    icon: BookUser,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const visibleNavigationItems = navigationItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === "ADMIN";
    }

    return true;
  });
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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-slate-900 text-white",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-700 p-6">
          <h1 className="truncate text-xl font-bold">Book Management</h1>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-4 py-3",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
