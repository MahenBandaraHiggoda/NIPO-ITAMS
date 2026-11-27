import DepartmentForm from "@/components/departments/department-form";

export default async function EditDepartmentPage({ params }) {
  const { id } = await params;
  return <DepartmentForm departmentId={id} />;
}
