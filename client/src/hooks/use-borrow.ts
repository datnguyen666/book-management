import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBorrows, returnBorrow } from "@/api/borrow.api";

export function useBorrows(page: number, limit: number) {
  return useQuery({
    queryKey: ["borrows", page, limit],
    queryFn: () =>
      getBorrows({
        page,
        limit,
      }),
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
