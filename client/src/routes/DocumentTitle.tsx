import { matchPath, useLocation } from "react-router-dom";

import { usePageTitle } from "@/hooks/use-page-title";

/** Tên tab cho từng route. Khớp theo tiêu đề hiển thị trong trang. */
const ROUTE_TITLES: Record<string, string | null> = {
  "/": null,
  "/login": "Login",
  "/set-password": "Set Password",
  "/dashboard": "Dashboard",
  "/categories": "Categories",
  "/books": "Books",
  "/books/:id": "Book Details",
  "/staff": "Staff Management",
  "/borrows": "Borrow Records",
  "/my-borrows": "My Borrowed Books",
  "/assets": "Library Assets",
  "/profile": "Profile",
  "/profile/edit": "Update Profile",
  "/members": "Reader Community",
  "/members/:id": "Reader Details",
};

function resolveTitle(pathname: string): string | null {
  for (const [pattern, title] of Object.entries(ROUTE_TITLES)) {
    if (matchPath({ path: pattern, end: true }, pathname)) return title;
  }

  return "Not Found";
}

/**
 * Đặt tên tab mặc định theo route hiện tại.
 *
 * Phải render trước <Routes /> để các trang có dữ liệu động
 * (ví dụ BookDetailPage) có thể ghi đè bằng usePageTitle.
 */
export function DocumentTitle() {
  const { pathname } = useLocation();

  usePageTitle(resolveTitle(pathname));

  return null;
}
