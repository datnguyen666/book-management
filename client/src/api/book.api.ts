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
  price: string | number;
  quantity: number;
  coverImage: string | null;
  categoryId: number;
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

interface BookDetailResponse {
  data: Book;
}

interface CreateBookResponse {
  data: Book;
}

interface UpdateBookResponse {
  data: Book;
}

export interface CreateBookPayload {
  title: string;
  isbn: string;
  author: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId: number;
}

export type UpdateBookPayload = Partial<CreateBookPayload>;

export interface SearchBookResult {
  id: number;
  title: string;
  author: string;
  isbn: string;
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
  const response = await api.get<BookDetailResponse>(`/books/${id}`);

  return response.data.data;
}

export async function uploadBookCover(id: number, file: File): Promise<Book> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<BookDetailResponse>(
    `/books/${id}/cover`,
    formData,
  );

  return response.data.data;
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const response = await api.post<CreateBookResponse>("/books", payload);

  return response.data.data;
}

export async function updateBook(
  id: number,
  payload: UpdateBookPayload,
): Promise<Book> {
  const response = await api.patch<UpdateBookResponse>(`/books/${id}`, payload);

  return response.data.data;
}

export async function deleteBook(id: number): Promise<void> {
  await api.delete(`/books/${id}`);
}

export async function searchBooks(q: string): Promise<SearchBookResult[]> {
  const response = await api.get<SearchBookResult[]>("/books/search", {
    params: { q },
  });

  return response.data;
}
