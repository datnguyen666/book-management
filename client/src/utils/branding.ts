import { matchPath } from "react-router-dom";
import type { Role } from "@/types/auth";

export interface AppBranding {
  title: string;
  subtitle: string;
  appName: string;
}

/**
 * Trả về thông tin nhận diện thương hiệu (Tên chính, phụ đề, tên ứng dụng)
 * dựa theo vai trò tài khoản hoặc trạng thái chưa đăng nhập.
 */
export function getAppBranding(role?: Role | null): AppBranding {
  if (role === "MEMBER") {
    return {
      title: "Book Library",
      subtitle: "Reader Portal",
      appName: "Book Library",
    };
  }

  if (role === "ADMIN" || role === "STAFF") {
    return {
      title: "Book Management",
      subtitle: "Management Portal",
      appName: "Book Management",
    };
  }

  return {
    title: "Digital Library",
    subtitle: "Welcome Portal",
    appName: "Digital Library",
  };
}

/**
 * Phân giải tiêu đề hiển thị trên Header và Tab trình duyệt
 * theo đường dẫn (pathname) và vai trò người dùng.
 */
export function getRouteTitle(pathname: string, role?: Role | null): string | null {
  if (pathname === "/") return null;

  const isMember = role === "MEMBER";

  const memberRouteMap: Record<string, string> = {
    "/books": "Search Books",
    "/books/:id": "Book Details",
    "/my-borrows": "Reading List",
    "/profile": "My Profile",
    "/profile/edit": "Update Profile",
  };

  const staffRouteMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/categories": "Categories",
    "/books": "Books",
    "/books/:id": "Book Details",
    "/staff": "Staff Management",
    "/members": "Reader Community",
    "/members/:id": "Reader Details",
    "/borrows": "Loans & Returns",
    "/assets": "Library Assets",
    "/profile": "My Profile",
    "/profile/edit": "Update Profile",
  };

  const publicRouteMap: Record<string, string> = {
    "/login": "Login",
    "/register": "Register",
    "/set-password": "Set Password",
  };

  const routeMap = isMember
    ? { ...publicRouteMap, ...memberRouteMap }
    : { ...publicRouteMap, ...staffRouteMap };

  for (const [pattern, title] of Object.entries(routeMap)) {
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return title;
    }
  }

  return "Page Not Found";
}
