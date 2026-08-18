import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomeRedirect } from "@/routes/HomeRedirect";
import { GuestRoute } from "./GuestRoute";

import { AdminLayout } from "@/components/layout/AdminLayout";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { BooksPage } from "@/pages/book/BooksPage";
import { CategoriesPage } from "@/pages/category/CategoriesPage";
import { BookDetailPage } from "@/pages/book/BookDetailPage";
import { StaffPage } from "@/pages/staff/StaffPage";
import { SetPasswordPage } from "@/pages/auth/SetPasswordPage";

function NotFoundPage() {
  return <h1>404 Not Found</h1>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Categories */}
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Books */}
            <Route path="/books" element={<BooksPage />} />

            {/* Book Detail */}
            <Route path="/books/:id" element={<BookDetailPage />} />

            {/* Staff */}
            <Route path="/staff" element={<StaffPage />} />

            {/* Set Password */}
            <Route path="/set-password" element={<SetPasswordPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
