import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 bg-slate-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
