export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">Book Management</h1>
      </div>

      <nav className="space-y-2 p-4">
        <button className="block w-full rounded px-4 py-2 text-left hover:bg-slate-700">
          Dashboard
        </button>

        <button className="block w-full rounded px-4 py-2 text-left hover:bg-slate-700">
          Categories
        </button>

        <button className="block w-full rounded px-4 py-2 text-left hover:bg-slate-700">
          Books
        </button>
      </nav>
    </aside>
  );
}
