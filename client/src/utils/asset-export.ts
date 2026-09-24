import * as XLSX from "xlsx";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import type { AssetSummary } from "@/api/asset.api";

pdfMake.addVirtualFileSystem(pdfFonts);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function exportAssetsToExcel(data: AssetSummary) {
  const workbook = XLSX.utils.book_new();

  // =========================================================
  // Summary sheet
  // =========================================================

  const summaryRows = [
    ["Library Assets"],
    ["Generated At", formatDateTime(new Date())],
    [],
    ["Metric", "Value"],
    ["Total Titles", data.totalTitles],
    ["Total Copies", data.totalCopies],
    ["Total Collection Value", data.totalCollectionValue],
    ["Borrowed Value", data.borrowedValue],
    ["Available Value", data.availableValue],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);

  summarySheet["!cols"] = [{ wch: 28 }, { wch: 24 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // =========================================================
  // Asset breakdown sheet
  // =========================================================

  const assetRows = data.data.map((book) => ({
    Book: book.title,
    ISBN: book.isbn,
    Category: book.category?.name ?? "-",
    Price: book.price,
    Quantity: book.quantity,
    Borrowed: book.borrowedQuantity,
    Available: book.availableQuantity,
    "Total Value": book.totalValue,
  }));

  const assetSheet = XLSX.utils.json_to_sheet(assetRows);

  assetSheet["!cols"] = [
    { wch: 45 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, assetSheet, "Asset Breakdown");

  // =========================================================
  // Download
  // =========================================================

  XLSX.writeFile(
    workbook,
    `library-assets-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

export function exportAssetsToPdf(data: AssetSummary) {
  const tableBody: TableCell[][] = [
    [
      { text: "Book", style: "tableHeader" },
      { text: "Category", style: "tableHeader" },
      {
        text: "Price",
        style: "tableHeader",
        alignment: "right",
      },
      {
        text: "Quantity",
        style: "tableHeader",
        alignment: "right",
      },
      {
        text: "Borrowed",
        style: "tableHeader",
        alignment: "right",
      },
      {
        text: "Available",
        style: "tableHeader",
        alignment: "right",
      },
      {
        text: "Total Value",
        style: "tableHeader",
        alignment: "right",
      },
    ],

    ...data.data.map((book): TableCell[] => [
      {
        text: `${book.title}\n${book.isbn}`,
      },
      {
        text: book.category?.name ?? "-",
      },
      {
        text: formatCurrency(book.price),
        alignment: "right",
      },
      {
        text: String(book.quantity),
        alignment: "right",
      },
      {
        text: String(book.borrowedQuantity),
        alignment: "right",
      },
      {
        text: String(book.availableQuantity),
        alignment: "right",
      },
      {
        text: formatCurrency(book.totalValue),
        alignment: "right",
      },
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "landscape" as const,

    pageMargins: [24, 32, 24, 32],

    header: {
      text: "Book Management",
      margin: [24, 16, 24, 0],
      fontSize: 9,
      color: "#6b7280",
    },

    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: "center" as const,
      fontSize: 8,
      color: "#9ca3af",
      margin: [0, 8, 0, 0],
    }),

    content: [
      {
        text: "Library Assets",
        style: "title",
      },

      {
        text: `Generated at ${formatDateTime(new Date())}`,
        style: "subtitle",
      },

      {
        margin: [0, 16, 0, 16],
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: [
            [
              {
                text: "Total Titles",
                style: "summaryLabel",
              },
              {
                text: "Total Copies",
                style: "summaryLabel",
              },
              {
                text: "Total Collection Value",
                style: "summaryLabel",
              },
              {
                text: "Borrowed Value",
                style: "summaryLabel",
              },
              {
                text: "Available Value",
                style: "summaryLabel",
              },
            ],
            [
              {
                text: String(data.totalTitles),
                style: "summaryValue",
              },
              {
                text: String(data.totalCopies),
                style: "summaryValue",
              },
              {
                text: formatCurrency(data.totalCollectionValue),
                style: "summaryValue",
              },
              {
                text: formatCurrency(data.borrowedValue),
                style: "summaryValue",
              },
              {
                text: formatCurrency(data.availableValue),
                style: "summaryValue",
              },
            ],
          ],
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? "#f3f4f6" : "#ffffff",
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },

      {
        text: "Asset Breakdown",
        style: "sectionTitle",
      },

      {
        table: {
          headerRows: 1,
          widths: ["*", 75, 65, 50, 50, 50, 75],
          body: tableBody,
        },

        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0
              ? "#111827"
              : rowIndex % 2 === 0
                ? "#f9fafb"
                : "#ffffff",

          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",

          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
    ],

    styles: {
      title: {
        fontSize: 20,
        bold: true,
        color: "#111827",
        margin: [0, 0, 0, 4],
      },

      subtitle: {
        fontSize: 9,
        color: "#6b7280",
      },

      sectionTitle: {
        fontSize: 13,
        bold: true,
        color: "#111827",
        margin: [0, 0, 0, 8],
      },

      tableHeader: {
        bold: true,
        color: "#ffffff",
        fontSize: 8,
      },

      summaryLabel: {
        fontSize: 8,
        color: "#6b7280",
        bold: true,
        alignment: "center" as const,
      },

      summaryValue: {
        fontSize: 11,
        color: "#111827",
        bold: true,
        alignment: "center" as const,
      },
    },

    defaultStyle: {
      font: "Roboto",
      fontSize: 8,
    },
  };

  pdfMake
    .createPdf(docDefinition)
    .download(`library-assets-${new Date().toISOString().slice(0, 10)}.pdf`);
}
