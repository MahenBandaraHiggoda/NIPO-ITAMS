/**
 * Export service adapters for Member 08 (Reports, Approvals & Activity).
 * Ready to be connected to Appwrite Storage / Functions or backend endpoints.
 */

/**
 * Escapes a cell value for RFC-4180 CSV output.
 * @param {string | number | undefined | null} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Generates and downloads a CSV file for the active report preview.
 * @param {import("./mock-data").ReportCategory} category
 * @param {Array<Record<string, string | number>>} rows
 * @returns {{ filename: string, rowCount: number }}
 */
export function exportReportAsCsv(category, rows) {
  const header = category.columns.map(escapeCsvValue).join(",");
  const body = rows.map((row) =>
    category.columns.map((col) => escapeCsvValue(row[col])).join(","),
  );
  const csvContent = [header, ...body].join("\r\n");

  const filename = `nipo-itams-${category.id}-report.csv`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, rowCount: rows.length };
}

/**
 * Triggers a mock/printable PDF export handoff ready for shared PDF service integration.
 * @param {import("./mock-data").ReportCategory} category
 * @param {Array<Record<string, string | number>>} rows
 * @returns {{ filename: string, rowCount: number }}
 */
export function exportReportAsPdf(category, rows) {
  const filename = `nipo-itams-${category.id}-report.pdf`;
  return { filename, rowCount: rows.length };
}
