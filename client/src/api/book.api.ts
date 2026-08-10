import { api } from "@/api/axios";

export interface BookCategory {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  author: string;
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  price: string;
  stock: number;
  coverImage: string | null;
  category: BookCategory;
  createdAt: string;
  updatedAt: string;
}

export interface BookPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookListResponse {
  data: Book[];
  pagination: BookPagination;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
}

export async function getBooks(
  params?: GetBooksParams,
): Promise<BookListResponse> {
  const response = await api.get<BookListResponse>("/books", {
    params,
  });

  return response.data;
}

export async function getBook(id: number): Promise<Book> {
  const response = await api.get<Book>(`/books/${id}`);

  return response.data;
}
