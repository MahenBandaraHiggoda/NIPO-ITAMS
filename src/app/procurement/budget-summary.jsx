const budgets = [
  { year: 2025, allocated: 9000000, utilized: 8100000 },
  { year: 2026, allocated: 12000000, utilized: 7800000 },
];

function rs(amount) {
  return "Rs. " + amount.toLocaleString("en-US");
}

export default function BudgetSummary() {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Budget summary</h2>

      {budgets.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No budget data yet.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {budgets.map((b) => {
            const remaining = b.allocated - b.utilized;
            const over = b.utilized > b.allocated;
            const percent =
              b.allocated > 0 ? Math.round((b.utilized / b.allocated) * 100) : 0;
            const barColor = over
              ? "bg-red-500"
              : percent >= 90
              ? "bg-amber-500"
              : "bg-blue-600";

            return (
              <div key={b.year} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.year}</p>
                  <p className="text-sm text-gray-500">{percent}% used</p>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${barColor}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Allocated</dt>
                    <dd>{rs(b.allocated)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Utilized</dt>
                    <dd>{rs(b.utilized)}</dd>
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt>{over ? "Over budget by" : "Remaining"}</dt>
                    <dd className={over ? "text-red-700" : ""}>
                      {rs(Math.abs(remaining))}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}