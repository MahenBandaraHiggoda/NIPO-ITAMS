"use client";

import { useState } from "react";

const requests = [
  { id: 1, year: 2025, item: "Desktop PC", requested: 15, approved: 15 },
  { id: 2, year: 2025, item: "Laptop", requested: 6, approved: 4 },
  { id: 3, year: 2026, item: "Desktop PC", requested: 20, approved: 12 },
  { id: 4, year: 2026, item: "Laptop", requested: 10, approved: 10 },
  { id: 5, year: 2026, item: "Printer", requested: 5, approved: 0 },
];

function getStatus(r) {
  if (r.approved === 0)
    return { label: "Not approved", cls: "bg-red-100 text-red-800" };
  if (r.approved < r.requested)
    return { label: "Partly approved", cls: "bg-amber-100 text-amber-800" };
  return { label: "Fully approved", cls: "bg-green-100 text-green-800" };
}

export default function ApprovalOutcomes() {
  const [year, setYear] = useState("all");

  const years = [...new Set(requests.map((r) => r.year))].sort();
  const rows =
    year === "all" ? requests : requests.filter((r) => r.year === Number(year));

  const totalRequested = rows.reduce((sum, r) => sum + r.requested, 0);
  const totalApproved = rows.reduce((sum, r) => sum + r.approved, 0);
  const totalOutstanding = totalRequested - totalApproved;

  const cards = [
    { label: "Requested", value: totalRequested },
    { label: "Approved", value: totalApproved },
    { label: "Outstanding (rolls to next year)", value: totalOutstanding },
  ];

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Approval outcomes</h2>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border p-2 text-sm"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No requests for this year.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3">Item</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Approved</th>
                <th className="p-3">Outstanding</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const status = getStatus(r);
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.year}</td>
                    <td className="p-3">{r.item}</td>
                    <td className="p-3">{r.requested}</td>
                    <td className="p-3">{r.approved}</td>
                    <td className="p-3 font-medium">
                      {r.requested - r.approved}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}