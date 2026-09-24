import {
  ArrowLeft,
  BookOpen,
  Copy,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAssets } from "@/hooks/use-assets";
import { useState } from "react";

import { exportAssetsToExcel, exportAssetsToPdf } from "@/utils/asset-export";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function LibraryAssetsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAssets();

  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Đang tải dữ liệu tài sản...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Không thể tải dữ liệu tài sản thư viện.
      </div>
    );
  }

  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportAssetsToPdf(data!);
    } else {
      exportAssetsToExcel(data!);
    }

    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Library Assets</h1>

            <p className="text-sm text-gray-500">
              Tổng quan giá trị tài sản của thư viện
            </p>
          </div>

          {/* Export */}
          <div className="relative flex shrink-0">
            {/* Download button */}
            <button
              type="button"
              onClick={handleExport}
              className={`flex items-center gap-2 rounded-l-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${
                exportFormat === "pdf" ? "bg-red-600" : "bg-green-600"
              }`}
            >
              <Download size={16} />

              {exportFormat === "pdf" ? "Export PDF" : "Export Excel"}
            </button>

            {/* Dropdown button */}
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((current) => !current)}
              className={`flex items-center justify-center rounded-r-md border-l border-white/30 px-2 text-white transition hover:opacity-90 ${
                exportFormat === "pdf" ? "bg-red-600" : "bg-green-600"
              }`}
              aria-label="Select export format"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isExportMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setExportFormat("pdf");
                    setIsExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileText size={16} className="text-red-600" />

                  <span>PDF</span>

                  {exportFormat === "pdf" && (
                    <span className="ml-auto text-xs font-semibold text-red-600">
                      Selected
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportFormat("excel");
                    setIsExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />

                  <span>Excel</span>

                  {exportFormat === "excel" && (
                    <span className="ml-auto text-xs font-semibold text-green-600">
                      Selected
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          icon={BookOpen}
          label="Total Titles"
          value={data.totalTitles.toString()}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          icon={Copy}
          label="Total Copies"
          value={data.totalCopies.toString()}
          iconClassName="bg-purple-50 text-purple-600"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Collection Value"
          value={formatCurrency(data.totalCollectionValue)}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Borrowed Value"
          value={formatCurrency(data.borrowedValue)}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Available Value"
          value={formatCurrency(data.availableValue)}
          iconClassName="bg-teal-50 text-teal-600"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Book
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Category
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Price
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Quantity
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Borrowed
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Available
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Total Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.data.map((book) => (
              <tr key={book.bookId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{book.title}</div>
                  <div className="text-xs text-gray-500">{book.isbn}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {book.category?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatCurrency(book.price)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {book.quantity}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {book.borrowedQuantity}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {book.availableQuantity}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(book.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
