import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomeRedirect } from "@/routes/HomeRedirect";
import { GuestRoute } from "./GuestRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { BooksPage } from "@/pages/book/BooksPage";
import { CategoriesPage } from "@/pages/category/CategoriesPage";

function NotFoundPage() {
  return <h1>404 Not Found</h1>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/books" element={<BooksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
