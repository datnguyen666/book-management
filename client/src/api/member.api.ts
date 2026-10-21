import { api } from "@/api/axios";

export interface MemberSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  memberCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalBorrows: number;
  borrowingCount: number;
  overdueCount: number;
}

export interface MemberDetailStats {
  totalBorrows: number;
  borrowingCount: number;
  returnedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface MemberDetail {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  memberCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats: MemberDetailStats;
}

export interface MemberBorrowRecord {
  id: number;
  borrowerName: string;
  borrowerCode: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: "PENDING" | "BORROWING" | "RETURNED" | "REJECTED" | "CANCELLED";
  notes?: string | null;
  rejectReason?: string | null;
  renewCount: number;
  createdAt: string;
  isOverdue: boolean;
  book: {
    id: number;
    title: string;
    isbn: string;
    author: string;
    coverImage?: string | null;
    price: number | string;
  };
  processedBy?: {
    id: number;
    fullName: string;
    username: string;
  } | null;
}

export interface MemberListResponse {
  data: MemberSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MemberBorrowsResponse {
  data: MemberBorrowRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}

export interface QueryMemberBorrowsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export async function getMembers(
  params?: QueryMembersParams,
): Promise<MemberListResponse> {
  const response = await api.get<MemberListResponse>("/members", {
    params,
  });
  return response.data;
}

export async function getMemberById(id: number): Promise<MemberDetail> {
  const response = await api.get<MemberDetail>(`/members/${id}`);
  return response.data;
}

export async function getMemberBorrows(
  id: number,
  params?: QueryMemberBorrowsParams,
): Promise<MemberBorrowsResponse> {
  const response = await api.get<MemberBorrowsResponse>(
    `/members/${id}/borrows`,
    {
      params,
    },
  );
  return response.data;
}

export async function updateMemberStatus(
  id: number,
  isActive: boolean,
): Promise<{ id: number; isActive: boolean }> {
  const response = await api.patch<{ id: number; isActive: boolean }>(
    `/members/${id}/status`,
    { isActive },
  );
  return response.data;
}
