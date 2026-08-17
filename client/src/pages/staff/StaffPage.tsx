import { Users, Plus } from "lucide-react";
import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useUpdateStaffStatus,
} from "@/hooks/use-staff";
import { useState } from "react";
import axios from "axios";
import { StaffModal } from "@/components/staff/StaffModal";
import type { CreateStaffFormData } from "@/schemas/staff.schema";
import { Edit } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import type { Staff } from "@/api/staff.api";

export function StaffPage() {
  const { data: staff = [], isLoading, isError } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const statusMutation = useUpdateStaffStatus();

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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage staff accounts and permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
          }}
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Status Error */}
      {statusMutation.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getStatusErrorMessage()}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading staff...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Failed to load staff.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && staff.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <Users className="mx-auto text-gray-400" size={40} />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No staff found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Create a staff account to get started.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && staff.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">STT</th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Full Name
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Username
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Role
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {staff.map((member, index) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {member.fullName}
                    </td>

                    <td className="px-6 py-4 text-gray-500">{member.email}</td>

                    <td className="px-6 py-4 text-gray-500">
                      {member.username}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        {member.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {member.isActive ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          disabled={statusMutation.isPending}
                          className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                        >
                          <Edit size={16} className="mr-1 inline" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={statusMutation.isPending}
                          className={
                            member.isActive
                              ? "text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                              : "text-xs font-medium text-green-600 hover:underline disabled:opacity-50"
                          }
                        >
                          {member.isActive ? (
                            <EyeOff size={16} className="mr-1 inline" />
                          ) : (
                            <Eye size={16} className="mr-1 inline" />
                          )}
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
