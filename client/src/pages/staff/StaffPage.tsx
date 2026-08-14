import { Users, Plus } from "lucide-react";

import { useStaff } from "@/hooks/use-staff";

export function StaffPage() {
  const { data: staff = [], isLoading, isError } = useStaff();

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
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          {member.isActive ? "Deactivate" : "Activate"}
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
    </div>
  );
}
