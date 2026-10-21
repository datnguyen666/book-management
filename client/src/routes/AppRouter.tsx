import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { HomeRedirect } from "@/routes/HomeRedirect";
import { GuestRoute } from "./GuestRoute";
import { DocumentTitle } from "./DocumentTitle";

import { Layout } from "@/components/layout/Layout";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { BooksPage } from "@/pages/book/BooksPage";
import { CategoriesPage } from "@/pages/category/CategoriesPage";
import { BookDetailPage } from "@/pages/book/BookDetailPage";
import { StaffPage } from "@/pages/staff/StaffPage";
import { SetPasswordPage } from "@/pages/auth/SetPasswordPage";
import { BorrowPage } from "@/pages/borrow/BorrowPage";
import { MyBorrowsPage } from "@/pages/borrow/MyBorrowsPage";
import { LibraryAssetsPage } from "@/pages/assets/LibraryAssetsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { UpdateProfilePage } from "@/pages/profile/UpdateProfilePage";
import { MembersPage } from "@/pages/member/MembersPage";
import { MemberDetailPage } from "@/pages/member/MemberDetailPage";

function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 font-serif">404</h1>
      <p className="mt-2 text-base text-gray-600">Trang bạn tìm kiếm không tồn tại.</p>
      <a
        href="/"
        className="mt-4 rounded-lg bg-[#8A5A1E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#724814]"
      >
        Về trang chủ
      </a>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <DocumentTitle />

      <Routes>
        {/* Root */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Set Password */}
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Dashboard (Staff & Admin only) */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <DashboardPage />
                </RoleRoute>
              }
            />

            {/* Categories (Staff & Admin only) */}
            <Route
              path="/categories"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <CategoriesPage />
                </RoleRoute>
              }
            />

            {/* Books (All logged in users) */}
            <Route path="/books" element={<BooksPage />} />

            {/* Book Detail (All logged in users) */}
            <Route path="/books/:id" element={<BookDetailPage />} />

            {/* My Borrows (Members, and available for all logged in users) */}
            <Route path="/my-borrows" element={<MyBorrowsPage />} />

            {/* Staff Management (Admin only) */}
            <Route
              path="/staff"
              element={
                <RoleRoute allowedRoles={["ADMIN"]}>
                  <StaffPage />
                </RoleRoute>
              }
            />

            {/* Member Management (Staff & Admin) */}
            <Route
              path="/members"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <MembersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <MemberDetailPage />
                </RoleRoute>
              }
            />

            {/* Staff Borrow Management (Staff & Admin only) */}
            <Route
              path="/borrows"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <BorrowPage />
                </RoleRoute>
              }
            />

            {/* Library Assets (Staff & Admin only) */}
            <Route
              path="/assets"
              element={
                <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
                  <LibraryAssetsPage />
                </RoleRoute>
              }
            />

            {/* Profile (All logged in users) */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<UpdateProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
