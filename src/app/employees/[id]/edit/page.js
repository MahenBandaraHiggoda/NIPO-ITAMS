import EmployeeForm from "@/components/employees/employee-form";

export default async function EditEmployeePage({ params }) {
  const { id } = await params;
  return <EmployeeForm employeeId={id} />;
}
