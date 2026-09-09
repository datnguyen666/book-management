import { api } from "@/api/axios";

export interface AssetCategory {
  id: number;
  name: string;
}

export interface AssetBook {
  bookId: number;
  title: string;
  isbn: string;
  price: number;
  quantity: number;
  borrowedQuantity: number;
  availableQuantity: number;
  totalValue: number;
  borrowedValue: number;
  availableValue: number;
  category: AssetCategory;
}

export interface AssetSummary {
  totalTitles: number;
  totalCopies: number;
  totalCollectionValue: number;
  borrowedValue: number;
  availableValue: number;
  data: AssetBook[];
}

export async function getAssetSummary(): Promise<AssetSummary> {
  const response = await api.get<AssetSummary>("/assets/summary");

  return response.data;
}
