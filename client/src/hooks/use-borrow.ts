import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBorrow,
  getBorrows,
  returnBorrow,
  type BorrowStatus,
  type CreateBorrowRequest,
} from "@/api/borrow.api";

interface UseBorrowsParams {
  page: number;
  limit: number;
  search?: string;
  status?: BorrowStatus | "";
}

export function useBorrows({ page, limit, search, status }: UseBorrowsParams) {
  return useQuery({
    queryKey: ["borrows", page, limit, search, status],
    queryFn: () =>
      getBorrows({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      }),
  });
}

export function useCreateBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBorrowRequest) => createBorrow(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });

      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}

export function useReturnBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => returnBorrow(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });

      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}
