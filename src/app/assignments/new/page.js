import AssignmentForm from "@/components/assignments/assignment-form";

export default async function NewAssignmentPage({ searchParams }) {
  const { employeeId } = await searchParams;
  return <AssignmentForm initialEmployeeId={employeeId || ""} />;
}
