import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
  return (
    <div className="flex h-screen ">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="shrink-0">
          <Header />
        </header>
        <main
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4"
          style={{ backgroundColor: "#faf8f3" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
