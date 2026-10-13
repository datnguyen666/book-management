import { useEffect } from "react";

export const APP_NAME = "Book Management";

/**
 * Cập nhật tên tab theo trang đang xem.
 *
 * - `string`    → `"{title} · Book Management"`
 * - `null`      → chỉ `"Book Management"`
 * - `undefined` → giữ nguyên tên tab hiện tại (dùng khi dữ liệu chưa tải xong)
 */
export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title === undefined) return;

    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
