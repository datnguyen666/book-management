import { BookOpen, FolderOpen, LayoutDashboard, User } from "lucide-react";
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
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const visibleNavigationItems = navigationItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === "ADMIN";
    }

    return true;
  });
  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">Book Management</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
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
  );
}
