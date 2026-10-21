import { useState, useTransition } from "react";
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

  const members = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalMembers = pagination?.total ?? 0;

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
    const actionText = member.isActive ? "khóa" : "mở khóa";
    const confirmMessage = member.isActive
      ? `Bạn có chắc chắn muốn KHÓA tài khoản của bạn đọc "${member.fullName || member.username}" (${member.memberCode || "Chưa có mã"})?\nSau khi khóa, bạn đọc này sẽ không thể đăng nhập hoặc yêu cầu mượn sách mới.`
      : `Bạn có muốn MỞ KHÓA tài khoản cho bạn đọc "${member.fullName || member.username}" (${member.memberCode || "Chưa có mã"})?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: member.id,
        isActive: !member.isActive,
      });
      window.alert(`Đã ${actionText} tài khoản bạn đọc thành công.`);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái bạn đọc:", error);
      window.alert(
        error.response?.data?.message ||
        `Không thể ${actionText} tài khoản bạn đọc. Vui lòng thử lại.`,
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B8863B]/30 bg-[#B8863B]/10 text-[#8A5A1E]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold"
              style={{ fontFamily: "'Source Serif 4', serif", color: "#12192B" }}>
              Reader Community
            </h1>
            <p className="text-sm text-slate-500">
              Tra cứu hồ sơ độc giả, theo dõi số lượng sách đang mượn và quản lý
              trạng thái tài khoản.
            </p>
          </div>
        </div>

        {/* Thống kê nhanh tổng số độc giả */}
        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm sm:self-auto">
          <span className="text-slate-500">Tổng bạn đọc:</span>
          <span className="font-semibold text-slate-900">{totalMembers}</span>
        </div>
      </div>

      {/* Toolbar: Tìm kiếm & Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên, mã thẻ, email, SĐT hoặc username..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C89B3C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30"
            />
          </div>

          {/* Lọc trạng thái */}
          <div className="w-full sm:w-48">
            <select
              value={status}
              onChange={handleStatusFilterChange}
              aria-label="Lọc theo trạng thái tài khoản"
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 focus:border-[#C89B3C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30"
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
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Bảng danh sách bạn đọc */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Mã bạn đọc</th>
                <th className="px-5 py-3.5 font-semibold">Họ và tên</th>
                <th className="px-5 py-3.5 font-semibold">Thông tin liên hệ</th>
                <th className="px-5 py-3.5 font-semibold">Sách đang mượn</th>
                <th className="px-5 py-3.5 font-semibold">Tổng lượt mượn</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#8A5A1E] border-t-transparent" />
                    <p className="mt-2 text-xs text-slate-400">Đang tải danh sách bạn đọc...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-rose-500">
                    <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
                    <p className="mt-2 font-medium">Không thể tải dữ liệu bạn đọc</p>
                    <p className="text-xs text-slate-400">Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Users className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-base font-medium text-slate-700">
                      Không tìm thấy bạn đọc nào
                    </p>
                    <p className="text-xs text-slate-400">
                      {search || status !== "all"
                        ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc."
                        : "Hệ thống chưa có tài khoản bạn đọc nào."}
                    </p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    {/* Mã bạn đọc */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {member.memberCode ? (
                        <span className="inline-flex items-center rounded-md border border-[#B8863B]/30 bg-[#B8863B]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#8A5A1E]">
                          {member.memberCode}
                        </span>
                      ) : (
                        <span className="text-xs italic text-slate-400">Chưa tạo mã</span>
                      )}
                    </td>

                    {/* Họ và tên & username */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {member.fullName || "Chưa cập nhật tên"}
                      </div>
                      <div className="text-xs text-slate-400">
                        @{member.username}
                      </div>
                    </td>

                    {/* Liên hệ */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Sách đang mượn */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.borrowingCount > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-500"
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
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <span className="font-medium text-slate-900">{member.totalBorrows}</span> lần
                    </td>

                    {/* Trạng thái hoạt động */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <UserCheck className="h-3 w-3" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          <UserX className="h-3 w-3" />
                          Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/members/${member.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          Chi tiết
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={updateStatusMutation.isPending}
                          title={member.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-xs transition focus:outline-none focus:ring-2 disabled:opacity-50 ${member.isActive
                            ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50 focus:ring-rose-300"
                            : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300"
                            }`}
                        >
                          {member.isActive ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              Mở khóa
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
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-3 sm:flex-row">
            <div className="text-xs text-slate-500">
              Trang <span className="font-medium text-slate-900">{page}</span> /{" "}
              <span className="font-medium text-slate-900">{totalPages}</span> (Tổng cộng{" "}
              <span className="font-medium text-slate-900">{totalMembers}</span> bạn đọc)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Trước
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
