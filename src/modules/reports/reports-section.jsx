"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  Building2,
  Download,
  FileSpreadsheet,
  FileText,
  FilterX,
  Lock,
  PackageOpen,
  Search,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportReportAsCsv, exportReportAsPdf } from "./export-service";
import {
  REPORT_CATEGORIES,
  REPORT_DEPARTMENTS,
  REPORT_PERIODS,
} from "./mock-data";

const categoryIcons = {
  inventory: Boxes,
  store: PackageOpen,
  maintenance: Wrench,
  departmental: Building2,
};

export default function ReportsSection({ canExport, onRecordAudit }) {
  const [selectedId, setSelectedId] = useState("inventory");
  const [department, setDepartment] = useState("All Departments");
  const [period, setPeriod] = useState("Current Quarter (Q4 2026)");
  const [search, setSearch] = useState("");
  const [exportNotice, setExportNotice] = useState(null);

  const activeCategory = useMemo(
    () =>
      REPORT_CATEGORIES.find((cat) => cat.id === selectedId) ??
      REPORT_CATEGORIES[0],
    [selectedId],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeCategory.rows.filter((row) => {
      const matchesDept =
        department === "All Departments" || row.Department === department;
      const matchesPeriod =
        period === "FY 2026 Full Year" || row.Period === period;
      const matchesSearch =
        !query ||
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(query),
        );
      return matchesDept && matchesPeriod && matchesSearch;
    });
  }, [activeCategory, department, period, search]);

  function handleCsvExport() {
    if (!canExport || filteredRows.length === 0) return;
    const result = exportReportAsCsv(activeCategory, filteredRows);
    setExportNotice({
      type: "CSV",
      message: `Exported ${result.rowCount} row(s) to ${result.filename}.`,
    });
    onRecordAudit?.({
      action: "Exported Report (CSV)",
      category: "Report",
      target: activeCategory.title,
      changeSummary: `Downloaded ${result.filename} (${result.rowCount} records, ${department})`,
    });
  }

  function handlePdfExport() {
    if (!canExport || filteredRows.length === 0) return;
    const result = exportReportAsPdf(activeCategory, filteredRows);
    setExportNotice({
      type: "PDF",
      message: `Prepared ${result.filename} (${result.rowCount} rows) for shared PDF service download.`,
    });
    onRecordAudit?.({
      action: "Exported Report (PDF)",
      category: "Report",
      target: activeCategory.title,
      changeSummary: `Generated ${result.filename} (${result.rowCount} records, ${department})`,
    });
  }

  function resetFilters() {
    setDepartment("All Departments");
    setPeriod("Current Quarter (Q4 2026)");
    setSearch("");
  }

  const hasActiveFilter =
    department !== "All Departments" ||
    period !== "Current Quarter (Q4 2026)" ||
    search.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Category Selector Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {REPORT_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.id];
          const isActive = category.id === activeCategory.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedId(category.id);
                setExportNotice(null);
              }}
              className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-white/15 text-amber-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {category.rows.length} rows
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{category.title}</h3>
                <p
                  className={`mt-0.5 line-clamp-2 text-xs ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {category.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Export Toolbar */}
      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
                Search records
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Code, item, staff..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
                Department
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  {REPORT_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
                Reporting period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  {REPORT_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <FilterX className="size-3.5" />
                  Reset
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCsvExport}
                disabled={!canExport || filteredRows.length === 0}
                title={
                  !canExport
                    ? "Export disabled in restricted viewer mode"
                    : "Download CSV snapshot"
                }
              >
                {!canExport ? (
                  <Lock className="size-3.5" />
                ) : (
                  <FileSpreadsheet className="size-3.5" />
                )}
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={handlePdfExport}
                disabled={!canExport || filteredRows.length === 0}
                title={
                  !canExport
                    ? "Export disabled in restricted viewer mode"
                    : "Generate PDF report"
                }
              >
                {!canExport ? (
                  <Lock className="size-3.5" />
                ) : (
                  <FileText className="size-3.5" />
                )}
                Export PDF
              </Button>
            </div>
          </div>

          {!canExport && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
              <Lock className="size-3.5 shrink-0" />
              Export controls are disabled because your current role has read-only permissions.
            </p>
          )}

          {exportNotice && (
            <div
              role="status"
              className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
            >
              <span className="flex items-center gap-2">
                <Download className="size-3.5 shrink-0" />
                {exportNotice.message}
              </span>
              <button
                type="button"
                onClick={() => setExportNotice(null)}
                className="font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {activeCategory.summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 sm:pt-5">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Preview Table */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{activeCategory.title} Preview</CardTitle>
            <CardDescription>
              Last generated: {activeCategory.lastGenerated} · Showing{" "}
              {filteredRows.length} of {activeCategory.rows.length} records
            </CardDescription>
          </div>
          <Badge variant="outline">{period}</Badge>
        </CardHeader>
        <CardContent>
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No matching report records
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing your search or selecting All Departments.
              </p>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={resetFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {activeCategory.columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row, idx) => (
                  <TableRow key={idx}>
                    {activeCategory.columns.map((col) => (
                      <TableCell key={col} className="text-slate-700">
                        {col === "Status" ? (
                          <Badge
                            variant={
                              row[col] === "Completed" || row[col] === "Assigned"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {row[col]}
                          </Badge>
                        ) : (
                          row[col]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
