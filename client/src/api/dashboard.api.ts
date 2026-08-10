import { api } from "@/api/axios";

export interface DashboardSummary {
  totalBooks: number;
  totalCategories: number;
  outOfStock: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");

  return response.data;
}
