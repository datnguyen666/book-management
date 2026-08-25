import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBorrows, returnBorrow } from "@/api/borrow.api";

export function useBorrows() {
  return useQuery({
    queryKey: ["borrows"],
    queryFn: getBorrows,
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

      // Quan trọng:
      // borrowedQuantity của Book cũng thay đổi
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });
}
