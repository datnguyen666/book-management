import { useQuery } from "@tanstack/react-query";

import { getAssetSummary } from "../api/asset.api";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: getAssetSummary,
  });
}
