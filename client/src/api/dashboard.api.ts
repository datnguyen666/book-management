import { api } from "@/api/axios";

export interface MonthlyAcquisition {
  month: number;
  count: number;
}

export interface MonthlyAcquisitions {
  year: number;
  data: MonthlyAcquisition[];
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface RecentBookCategory {
  id: number;
  name: string;
}

export interface RecentBook {
  id: number;
  title: string;
  isbn: string;
  author: string;
  createdAt: string;
  coverImage: string | null;
  category: RecentBookCategory;
}

export interface DashboardSummary {
  totalBooks: number;
  totalCategories: number;
  currentlyBorrowed: number;
  overdue: number;
  monthlyAcquisitions: MonthlyAcquisitions;
  categoryBreakdown: CategoryBreakdown[];
  recentBooks: RecentBook[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");

  return response.data;
}
