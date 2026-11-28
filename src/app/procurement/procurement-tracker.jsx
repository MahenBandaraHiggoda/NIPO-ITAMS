"use client";

import { useState } from "react";

const stages = ["Requested", "Approved", "Quotation", "Ordered", "Delivered"];

const purchases = [
  { id: 1, ref: "PR-2026-014", item: "Desktop PC", quantity: 12, stage: 3, updated: "2026-11-10" },
  { id: 2, ref: "PR-2026-021", item: "Laptop", quantity: 10, stage: 4, updated: "2026-11-02" },
  { id: 3, ref: "PR-2026-027", item: "Printer", quantity: 5, stage: 0, updated: "2026-11-20" },
  { id: 4, ref: "PR-2026-030", item: "Network switch", quantity: 3, stage: 2, updated: "2026-11-18" },
  { id: 5, ref: "PR-2025-044", item: "Scanner", quantity: 2, stage: 1, updated: "2026-11-15" },
];

export default function ProcurementTracker() {
  const [filter, setFilter] = useState("all");

  const rows =
    filter === "all"
      ? purchases
      : purchases.filter((p) => p.stage === Number(filter));

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Procurement tracker</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border p-2 text-sm"
        >
          <option value="all">All stages</option>
          {stages.map((s, i) => (
            <option key={s} value={i}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No purchases at this stage.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {p.quantity} x {p.item}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.ref} | Last updated {p.updated}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.stage === stages.length - 1
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {stages[p.stage]}
                </span>
              </div>

              <ol className="mt-4 grid grid-cols-5 gap-2">
                {stages.map((s, i) => (
                  <li key={s}>
                    <div
                      className={`h-2 rounded-full ${
                        i <= p.stage ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                    <p
                      className={`mt-1 text-xs ${
                        i === p.stage
                          ? "font-medium text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {s}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}