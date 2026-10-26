import { useLocation } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthStore } from "@/store/auth.store";
import { getRouteTitle } from "@/utils/branding";

/**
 * Đặt tên tab mặc định theo route hiện tại và vai trò người dùng.
 *
 * Phải render trước <Routes /> để các trang có dữ liệu động
 * (ví dụ BookDetailPage) có thể ghi đè bằng usePageTitle.
 */
export function DocumentTitle() {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  usePageTitle(getRouteTitle(pathname, user?.role));

  return null;
}
