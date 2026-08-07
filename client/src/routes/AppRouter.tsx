import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomeRedirect } from "@/routes/HomeRedirect";
import { GuestRoute } from "./GuestRoute";

function DashboardPage() {
  return <h1>Dashboard</h1>;
}

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
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
