import { api } from "./axios";

export type BorrowStatus =
  | "PENDING"
  | "BORROWING"
  | "RETURNED"
  | "REJECTED"
  | "CANCELLED";

export interface BorrowBook {
  id: number;
  title: string;
  isbn: string;
  quantity: number;
  borrowedQuantity: number;
  author?: string;
  coverImage?: string | null;
  category?: {
    id: number;
    name: string;
  };
}

export interface BorrowProcessedBy {
  id: number;
  username: string;
  fullName: string;
  role?: "ADMIN" | "STAFF";
}

export interface BorrowUser {
  id: number;
  email: string;
  phone?: string | null;
  memberCode?: string | null;
}

export interface BorrowRecord {
  id: number;
  borrowerName: string;
  borrowerCode: string;
  bookId: number;
  userId?: number | null;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: BorrowStatus;
  notes?: string | null;
  rejectReason?: string | null;
  renewCount: number;
  processedById?: number | null;
  book: BorrowBook;
  processedBy?: BorrowProcessedBy | null;
  user?: BorrowUser | null;
  createdAt: string;
  updatedAt: string;
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
  status?: BorrowStatus | "";
}

export interface CreateBorrowRequest {
  borrowerName: string;
  borrowerCode: string;
  bookId: number;
  dueDate: string;
}

export interface RequestBorrowPayload {
  bookId: number;
  notes?: string;
}

export interface BorrowActionResponse {
  message: string;
  data: {
    borrowRecord: BorrowRecord;
    book?: {
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

export async function getMyBorrows(
  params?: GetBorrowsParams,
): Promise<BorrowListResponse> {
  const response = await api.get<BorrowListResponse>("/borrows/my-borrows", {
    params,
  });

  return response.data;
}

export async function requestBorrow(
  data: RequestBorrowPayload,
): Promise<BorrowActionResponse> {
  const response = await api.post<BorrowActionResponse>(
    "/borrows/request",
    data,
  );

  return response.data;
}

export async function cancelBorrow(
  id: number,
): Promise<BorrowActionResponse> {
  const response = await api.patch<BorrowActionResponse>(
    `/borrows/${id}/cancel`,
  );

  return response.data;
}

export async function renewBorrow(
  id: number,
): Promise<BorrowActionResponse> {
  const response = await api.patch<BorrowActionResponse>(
    `/borrows/${id}/renew`,
  );

  return response.data;
}

export async function approveBorrow(
  id: number,
): Promise<BorrowActionResponse> {
  const response = await api.patch<BorrowActionResponse>(
    `/borrows/${id}/approve`,
  );

  return response.data;
}

export async function rejectBorrow(
  id: number,
  reason?: string,
): Promise<BorrowActionResponse> {
  const response = await api.patch<BorrowActionResponse>(
    `/borrows/${id}/reject`,
    { reason },
  );

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
