import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getAppBranding } from "@/utils/branding";

export const APP_NAME = "Digital Library";

/**
 * Cập nhật tên tab theo trang đang xem và vai trò của người dùng.
 *
 * - `string`    → `"{title} · {appName}"`
 * - `null`      → chỉ `"{appName}"`
 * - `undefined` → giữ nguyên tên tab hiện tại (dùng khi dữ liệu chưa tải xong)
 */
export function usePageTitle(title: string | null | undefined) {
  const user = useAuthStore((state) => state.user);
  const appName = getAppBranding(user?.role).appName;

  useEffect(() => {
    if (title === undefined) return;

    document.title = title ? `${title} · ${appName}` : appName;
  }, [title, appName]);
}

