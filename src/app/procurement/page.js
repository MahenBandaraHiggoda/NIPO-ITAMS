const requests = [
  { id: 1, year: 2026, item: "Desktop PC", requested: 20, approved: 12 },
  { id: 2, year: 2026, item: "Laptop", requested: 10, approved: 10 },
  { id: 3, year: 2026, item: "Printer", requested: 5, approved: 0 },
];

export default function ProcurementPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Procurement & Annual Planning</h1>
      <p className="mt-1 text-sm text-gray-500">
        Requested, approved and outstanding quantities by year.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Year</th>
              <th className="p-3">Item</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Approved</th>
              <th className="p-3">Outstanding (rolls to next year)</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.year}</td>
                <td className="p-3">{r.item}</td>
                <td className="p-3">{r.requested}</td>
                <td className="p-3">{r.approved}</td>
                <td className="p-3 font-medium">{r.requested - r.approved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}