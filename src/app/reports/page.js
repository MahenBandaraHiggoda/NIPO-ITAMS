import ReportsWorkspace from "@/modules/reports/reports-workspace";

export const metadata = {
  title: "NIPO ITAMS | Reports, Approvals & Activity",
  description:
    "Operational reports, pending approval queue, and audit activity log for NIPO ITAMS.",
};

export default function ReportsPage() {
  return <ReportsWorkspace />;
}
