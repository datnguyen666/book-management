import { api } from "./axios";

export type BorrowStatus = "BORROWING" | "RETURNED";

export interface BorrowBook {
  id: number;
  title: string;
  isbn: string;
  quantity: number;
  borrowedQuantity: number;
}

export interface BorrowProcessedBy {
  id: number;
  username: string;
  fullName: string;
  role?: "ADMIN" | "STAFF";
}

export interface BorrowRecord {
  id: number;
  borrowerName: string;
  borrowerCode: string;
  bookId: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: BorrowStatus;
  processedById: number;
  book: BorrowBook;
  processedBy: BorrowProcessedBy;
}

export interface BorrowPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BorrowListResponse {
  data: BorrowRecord[];
  pagination: BorrowPagination;
}

export interface GetBorrowsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BorrowStatus;
}

export interface CreateBorrowRequest {
  borrowerName: string;
  borrowerCode: string;
  bookId: number;
  dueDate: string;
}

export interface BorrowActionResponse {
  message: string;
  data: {
    borrowRecord: BorrowRecord;
    book: {
      id: number;
      title: string;
      quantity: number;
      borrowedQuantity: number;
    };
  };
}

export async function getBorrows(
  params?: GetBorrowsParams,
): Promise<BorrowListResponse> {
  const response = await api.get<BorrowListResponse>("/borrows", {
    params,
  });

  return response.data;
}

export async function createBorrow(
  data: CreateBorrowRequest,
): Promise<BorrowActionResponse> {
  const response = await api.post<BorrowActionResponse>("/borrows", data);

  return response.data;
}

export async function returnBorrow(id: number): Promise<BorrowActionResponse> {
  const response = await api.patch<BorrowActionResponse>(
    `/borrows/${id}/return`,
  );

  return response.data;
}
