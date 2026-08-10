import { api } from "@/api/axios";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
}

interface CategoryListResponse {
  data: Category[];
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<CategoryListResponse>("/categories");

  return response.data.data;
}

export async function createCategory(
  data: CreateCategoryRequest,
): Promise<Category> {
  const response = await api.post<Category>("/categories", data);

  return response.data;
}
