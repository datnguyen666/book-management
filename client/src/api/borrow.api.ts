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

export interface BorrowListResponse {
  data: BorrowRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getBorrows(): Promise<BorrowRecord[]> {
  const response = await api.get<BorrowListResponse>("/borrows");
  return response.data.data;
}

export async function returnBorrow(id: number): Promise<BorrowRecord> {
  const response = await api.patch<BorrowRecord>(`/borrows/${id}/return`);

  return response.data;
}
