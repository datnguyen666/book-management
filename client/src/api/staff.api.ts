import { api } from "@/api/axios";

export interface Staff {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "STAFF";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffPayload {
  email: string;
  fullName: string;
}

export interface UpdateStaffPayload {
  email?: string;
  fullName?: string;
}

export async function getStaff(): Promise<Staff[]> {
  const response = await api.get<Staff[]>("/staff");

  return response.data;
}

export async function createStaff(payload: CreateStaffPayload): Promise<Staff> {
  const response = await api.post<Staff>("/staff", payload);

  return response.data;
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffPayload,
): Promise<Staff> {
  const response = await api.patch<Staff>(`/staff/${id}`, payload);

  return response.data;
}

export async function updateStaffStatus(
  id: number,
  isActive: boolean,
): Promise<Staff> {
  const response = await api.patch<Staff>(`/staff/${id}/status`, {
    isActive,
  });

  return response.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/staff/${id}`);
}
