import { useState, useTransition, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Eye,
  Lock,
  Unlock,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCheck,
  UserX,
  Mail,
  Phone,
  X,
  AlertCircle,
} from "lucide-react";
import { useMembers, useUpdateMemberStatus } from "@/hooks/use-member";
import type { MemberSummary } from "@/api/member.api";

const ITEMS_PER_PAGE = 10;

export function MembersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [, startTransition] = useTransition();

  const { data, isLoading, isError, isFetching, refetch } = useMembers({
    page,
    limit: ITEMS_PER_PAGE,
    search: search.trim() || undefined,
    status,
  });

  const updateStatusMutation = useUpdateMemberStatus();

  const members = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalMembers = pagination?.total ?? 0;

  // Thống kê nhanh từ danh sách hiện tại
  const activeMembersCount = useMemo(() => {
    return members.filter((m) => m.isActive).length;
  }, [members]);

  const borrowingMembersCount = useMemo(() => {
    return members.filter((m) => m.borrowingCount > 0).length;
  }, [members]);

  const lockedMembersCount = useMemo(() => {
    return members.filter((m) => !m.isActive).length;
  }, [members]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearch(value);
      setPage(1);
    });
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as "all" | "active" | "inactive");
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    refetch();
  };

  const handleToggleStatus = async (member: MemberSummary) => {
    const confirmMessage = member.isActive
      ? `Bạn có chắc chắn muốn KHÓA tài khoản của bạn đọc "${member.fullName || member.username}" (${member.memberCode || "Chưa có mã"})?\nLưu ý: Sau khi khóa, bạn đọc sẽ không thể đăng nhập hoặc gửi yêu cầu mượn sách mới.`
      : `Bạn có muốn MỞ KHÓA tài khoản cho bạn đọc "${member.fullName || member.username}" (${member.memberCode || "Chưa có mã"})?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: member.id,
        isActive: !member.isActive,
      });
    } catch {
      // Lỗi được hiển thị qua mutation state
    }
  };

  const getInitials = (name?: string | null, fallback = "BĐ") => {
    if (!name) return fallback;
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">
              <Users size={12} />
              Cộng đồng độc giả thư viện
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 font-heading">
            Quản lý danh sách bạn đọc
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tra cứu hồ sơ độc giả, theo dõi số lượng sách đang mượn và kiểm soát quyền truy cập hệ thống.
          </p>
        </div>

        {/* Tổng số độc giả */}
        <div className="flex items-center gap-2.5 self-start rounded-2xl border border-gray-200/80 bg-white px-4 py-2 text-sm shadow-2xs sm:self-auto">
          <span className="text-gray-500 text-xs">Tổng số bạn đọc:</span>
          <span className="font-bold text-gray-900 font-mono text-base">{totalMembers}</span>
        </div>
      </div>

      {/* Thẻ Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng bạn đọc</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">{totalMembers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đang hoạt động</p>
            <p className="mt-0.5 text-xl font-bold text-emerald-700">{activeMembersCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đang mượn sách</p>
            <p className="mt-0.5 text-xl font-bold text-blue-700">{borrowingMembersCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tài khoản bị khóa</p>
            <p className="mt-0.5 text-xl font-bold text-rose-700">{lockedMembersCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Tìm kiếm & Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên, mã thẻ, email, SĐT hoặc username..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Lọc trạng thái */}
          <div className="w-full sm:w-48">
            <select
              value={status}
              onChange={handleStatusFilterChange}
              aria-label="Lọc theo trạng thái tài khoản"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đang bị khóa</option>
            </select>
          </div>
        </div>

        {/* Nút reset */}
        <button
          type="button"
          onClick={handleResetFilters}
          title="Làm mới bộ lọc"
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 shrink-0"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Thông báo lỗi khi cập nhật trạng thái */}
      {updateStatusMutation.error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>Không thể cập nhật trạng thái bạn đọc. Vui lòng thử lại sau.</span>
          </div>
          <button
            type="button"
            onClick={() => updateStatusMutation.reset()}
            className="cursor-pointer text-xs font-semibold text-red-700 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Bảng danh sách bạn đọc */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200/80 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="min-w-[130px] px-5 py-3.5">Mã bạn đọc</th>
                <th className="min-w-[220px] px-5 py-3.5">Bạn đọc</th>
                <th className="min-w-[220px] px-5 py-3.5">Thông tin liên hệ</th>
                <th className="min-w-[150px] px-5 py-3.5">Sách đang mượn</th>
                <th className="min-w-[130px] px-5 py-3.5">Tổng lượt mượn</th>
                <th className="min-w-[130px] px-5 py-3.5">Trạng thái</th>
                <th className="min-w-[140px] px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Đang tải danh sách bạn đọc...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-red-600">
                    <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
                    <p className="mt-2 text-sm font-semibold">Không thể tải dữ liệu bạn đọc</p>
                    <p className="text-xs text-red-500 mt-0.5">Vui lòng kiểm tra lại kết nối hoặc tải lại trang.</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm font-semibold text-gray-800">
                      {search.trim()
                        ? "Không tìm thấy bạn đọc nào phù hợp với từ khóa tìm kiếm."
                        : "Chưa có tài khoản bạn đọc nào trong hệ thống."}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {search || status !== "all"
                        ? "Thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc."
                        : "Các tài khoản độc giả đăng ký sẽ được hiển thị tại đây."}
                    </p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-amber-50/25"
                  >
                    {/* Mã bạn đọc */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {member.memberCode ? (
                        <span className="inline-flex items-center rounded-lg border border-amber-200/70 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-800">
                          {member.memberCode}
                        </span>
                      ) : (
                        <span className="text-xs italic text-gray-400">Chưa tạo mã</span>
                      )}
                    </td>

                    {/* Họ và tên & username (kèm Avatar initials) */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xs font-bold text-purple-700 shadow-2xs">
                          {getInitials(member.fullName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {member.fullName || "Chưa cập nhật tên"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            @{member.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Liên hệ */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Sách đang mượn */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            member.borrowingCount > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <BookOpen className="h-3 w-3" />
                          {member.borrowingCount} cuốn
                        </span>

                        {member.overdueCount > 0 && (
                          <span
                            title={`Có ${member.overdueCount} cuốn quá hạn chưa trả!`}
                            className="inline-flex items-center gap-0.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700"
                          >
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                            {member.overdueCount} quá hạn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tổng lượt mượn */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">
                      <span className="font-bold text-gray-900 text-sm font-mono">
                        {member.totalBorrows}
                      </span>{" "}
                      lượt mượn
                    </td>

                    {/* Trạng thái hoạt động */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Đã bị khóa
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/members/${member.id}`}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900"
                          title="Xem hồ sơ chi tiết bạn đọc"
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-500" />
                          <span>Chi tiết</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={updateStatusMutation.isPending}
                          title={member.isActive ? "Khóa tài khoản bạn đọc" : "Mở khóa tài khoản bạn đọc"}
                          className={`cursor-pointer inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-2xs transition disabled:opacity-50 ${
                            member.isActive
                              ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {member.isActive ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Khóa</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              <span>Mở khóa</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row">
            <div className="text-xs text-gray-500">
              Trang <span className="font-semibold text-gray-900">{page}</span> /{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span> (Tổng cộng{" "}
              <span className="font-semibold text-gray-900">{totalMembers}</span> bạn đọc)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Trước</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
