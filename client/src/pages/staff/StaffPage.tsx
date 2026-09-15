import { Users, Plus } from "lucide-react";
import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useUpdateStaffStatus,
  useDeleteStaff,
} from "@/hooks/use-staff";
import { useState } from "react";
import axios from "axios";
import { StaffModal } from "@/components/staff/StaffModal";
import type { CreateStaffFormData } from "@/schemas/staff.schema";
import { Edit } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import type { Staff } from "@/api/staff.api";
import { Trash2 } from "lucide-react";

export function StaffPage() {
  const { data: staff = [], isLoading, isError } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const statusMutation = useUpdateStaffStatus();
  const deleteMutation = useDeleteStaff();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const modalInitialData = selectedStaff
    ? {
        fullName: selectedStaff.fullName,
        email: selectedStaff.email,
      }
    : undefined;

  const handleOpenCreate = () => {
    createMutation.reset();
    updateMutation.reset();

    setSelectedStaff(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    createMutation.reset();
    updateMutation.reset();

    setSelectedStaff(staff);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }

    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const handleSubmit = async (data: CreateStaffFormData) => {
    createMutation.reset();
    updateMutation.reset();

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          fullName: data.fullName,
          email: data.email,
        });
      } else if (selectedStaff) {
        await updateMutation.mutateAsync({
          id: selectedStaff.id,
          data: {
            fullName: data.fullName,
            email: data.email,
          },
        });
      }

      handleCloseModal();
    } catch {
      // Error is displayed through mutation state.
    }
  };

  const getMutationError = () => {
    const error =
      modalMode === "edit" ? updateMutation.error : createMutation.error;

    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return "Email already exists.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Staff was not found.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "You do not have permission to modify staff accounts.";
    }

    return modalMode === "edit"
      ? "Failed to update staff. Please try again."
      : "Failed to create staff. Please try again.";
  };

  const handleToggleStatus = async (staff: Staff) => {
    const nextStatus = !staff.isActive;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${staff.fullName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await statusMutation.mutateAsync({
        id: staff.id,
        isActive: nextStatus,
      });
    } catch {
      // Error is handled below.
    }
  };

  const handleDelete = async (staff: Staff) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${staff.fullName}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(staff.id);
    } catch {
      // Error is handled below.
    }
  };

  const getDeleteErrorMessage = () => {
    const error = deleteMutation.error;

    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Staff was not found.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "You do not have permission to delete staff accounts.";
    }

    return "Failed to delete staff. Please try again.";
  };

  const getStatusErrorMessage = () => {
    const error = statusMutation.error;

    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "Staff was not found.";
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return "You do not have permission to change staff status.";
    }

    return "Failed to update staff status. Please try again.";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "'Source Serif 4', serif", color: "#12192B" }}
          >
            Staff Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#8A93A6" }}>
            Manage staff accounts and permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#12192B",
            color: "#C89B3C",
          }}
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Status Error */}
      {statusMutation.error && (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            border: "1px solid #A6432C33",
            backgroundColor: "#FBEFEC",
            color: "#A6432C",
          }}
        >
          {getStatusErrorMessage()}
        </div>
      )}

      {/* Delete Error */}
      {deleteMutation.error && (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            border: "1px solid #A6432C33",
            backgroundColor: "#FBEFEC",
            color: "#A6432C",
          }}
        >
          {getDeleteErrorMessage()}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="rounded-lg bg-white p-6 text-sm"
          style={{ border: "1px solid #E6DFCE", color: "#8A93A6" }}
        >
          Loading staff...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-lg p-6 text-sm"
          style={{
            border: "1px solid #A6432C33",
            backgroundColor: "#FBEFEC",
            color: "#A6432C",
          }}
        >
          Failed to load staff.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && staff.length === 0 && (
        <div
          className="rounded-lg bg-white p-10 text-center"
          style={{ border: "1px solid #E6DFCE" }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ border: "1px solid #B8863B55" }}
          >
            <Users size={20} style={{ color: "#B8863B" }} />
          </div>

          <p className="mt-3 text-sm font-medium" style={{ color: "#12192B" }}>
            No staff found
          </p>

          <p className="mt-1 text-xs" style={{ color: "#B0B7C4" }}>
            Create a staff account to get started.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && staff.length > 0 && (
        <div
          className="overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(18,25,43,0.06),0_8px_24px_-12px_rgba(18,25,43,0.14)]"
          style={{ border: "1px solid #D8CEB2" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead
                style={{
                  backgroundColor: "#EFE3C4",
                  borderBottom: "1px solid #D8CEB2",
                }}
              >
                <tr>
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    STT
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Full Name
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Email
                  </th>

                  <th
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Username
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Role
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Status
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7A6A46" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member, index) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-[#FAF7EF]"
                    style={{ borderTop: "1px solid #E6DFCE" }}
                  >
                    <td
                      className="px-6 py-4 text-center align-middle tabular-nums"
                      style={{ color: "#B0B7C4" }}
                    >
                      {index + 1}
                    </td>

                    <td
                      className="px-6 py-4 font-medium"
                      style={{ color: "#12192B" }}
                    >
                      {member.fullName}
                    </td>

                    <td className="px-6 py-4" style={{ color: "#6B7280" }}>
                      {member.email}
                    </td>

                    <td className="px-6 py-4" style={{ color: "#6B7280" }}>
                      {member.username}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: "#F0EADA", color: "#8A6B2C" }}
                      >
                        {member.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {member.isActive ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "#EAF2E9",
                            color: "#3F6B44",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "#3F6B44" }}
                          />
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "#F1F0EC",
                            color: "#8A93A6",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "#B0B7C4" }}
                          />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          disabled={statusMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F7F2E7] disabled:opacity-50 cursor-pointer"
                          style={{
                            border: "1px solid #B8863B55",
                            color: "#B8863B",
                          }}
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={statusMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-50 cursor-pointer"
                          style={
                            member.isActive
                              ? {
                                  border: "1px solid #A6432C55",
                                  color: "#A6432C",
                                  backgroundColor: "transparent",
                                }
                              : {
                                  border: "1px solid #3F6B4455",
                                  color: "#3F6B44",
                                  backgroundColor: "transparent",
                                }
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              member.isActive ? "#FBEFEC" : "#EAF2E9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          {member.isActive ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          disabled={
                            member.isActive ||
                            statusMutation.isPending ||
                            deleteMutation.isPending
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#FBEFEC] disabled:opacity-40 cursor-pointer"
                          style={{
                            border: "1px solid #A6432C55",
                            color: "#A6432C",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <StaffModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={modalInitialData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={getMutationError()}
      />
    </div>
  );
}
