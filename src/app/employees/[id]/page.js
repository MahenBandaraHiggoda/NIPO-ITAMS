import EmployeeDetailsPage from "@/components/employees/employee-details-page";

export default async function EmployeePage({ params }) {
  const { id } = await params;
  return <EmployeeDetailsPage employeeId={id} />;
}
