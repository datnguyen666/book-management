import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveBorrow,
  cancelBorrow,
  createBorrow,
  getBorrows,
  getMyBorrows,
  rejectBorrow,
  renewBorrow,
  requestBorrow,
  returnBorrow,
  type BorrowStatus,
  type CreateBorrowRequest,
  type RequestBorrowPayload,
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

export function useMyBorrows({ page, limit, search, status }: UseBorrowsParams) {
  return useQuery({
    queryKey: ["my-borrows", page, limit, search, status],
    queryFn: () =>
      getMyBorrows({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      }),
  });
}

export function useRequestBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestBorrowPayload) => requestBorrow(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}

export function useCancelBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelBorrow(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });
    },
  });
}

export function useRenewBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => renewBorrow(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });
    },
  });
}

export function useApproveBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveBorrow(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}

export function useRejectBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rejectBorrow(id, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-borrows"],
      });
    },
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
        queryKey: ["my-borrows"],
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}
