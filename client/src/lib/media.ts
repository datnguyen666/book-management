const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:3000";

export function getMediaUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
