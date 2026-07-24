import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function DashboardPage() {
  return <h1>Dashboard</h1>;
}

function LoginPage() {
  return <h1>Login</h1>;
}

function NotFoundPage() {
  return <h1>404 Not Found</h1>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
