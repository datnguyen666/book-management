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

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
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

export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest,
): Promise<Category> {
  const response = await api.patch<Category>(`/categories/${id}`, data);

  return response.data;
}

export async function deleteCategory(id: number): Promise<Category> {
  const response = await api.delete<Category>(`/categories/${id}`);

  return response.data;
}
