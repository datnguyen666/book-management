import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMembers,
  getMemberById,
  getMemberBorrows,
  updateMemberStatus,
  type QueryMembersParams,
  type QueryMemberBorrowsParams,
} from "@/api/member.api";

export function useMembers(params?: QueryMembersParams) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => getMembers(params),
  });
}

export function useMember(id: number) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => getMemberById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useMemberBorrows(
  id: number,
  params?: QueryMemberBorrowsParams,
) {
  return useQuery({
    queryKey: ["member-borrows", id, params],
    queryFn: () => getMemberBorrows(id, params),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateMemberStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member", variables.id],
      });
    },
  });
}
