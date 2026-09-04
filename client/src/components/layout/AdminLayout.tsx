import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen ">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="shrink-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
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
