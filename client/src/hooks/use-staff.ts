import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from "@/api/staff.api";

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffPayload }) =>
      updateStaff(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      });
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateStaffStatus(id, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteStaff(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      });
    },
  });
}
