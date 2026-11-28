import ApprovalOutcomes from "./approval-outcomes";
import BudgetSummary from "./budget-summary";
import RequestForm from "./request-form";

export default function ProcurementPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Procurement & Annual Planning</h1>
      <p className="mt-1 text-sm text-gray-500">
        Requested, approved and outstanding quantities by year.
      </p>

      <ApprovalOutcomes />
      <BudgetSummary />
      <RequestForm />
    </main>
  );
}