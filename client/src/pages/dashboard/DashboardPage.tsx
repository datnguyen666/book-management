import { BookOpen, FolderOpen, PackageX } from "lucide-react";

interface SummaryCard {
  title: string;
  value: number;
  description: string;
  icon: typeof BookOpen;
}

const summaryCards: SummaryCard[] = [
  {
    title: "Total Books",
    value: 128,
    description: "Books in the system",
    icon: BookOpen,
  },
  {
    title: "Total Categories",
    value: 12,
    description: "Categories available",
    icon: FolderOpen,
  },
  {
    title: "Out of Stock",
    value: 8,
    description: "Books need restocking",
    icon: PackageX,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your book management system.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                {/* Text */}
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {card.description}
                  </p>
                </div>

                {/* Icon */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "#111827",
                    color: "#d4a853",
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
