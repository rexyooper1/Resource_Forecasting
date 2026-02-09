import { getLCATs, getSkills, getEmployee } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { EmployeeForm } from "@/components/employees/employee-form";

interface NewEmployeePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewEmployeePage({ searchParams }: NewEmployeePageProps) {
  const params = await searchParams;
  const lcats = getLCATs();
  const skills = getSkills();
  const employee = params.id ? getEmployee(params.id) : undefined;

  const isEditing = !!employee;

  return (
    <div>
      <Header
        title={isEditing ? "Edit Employee" : "Add Employee"}
        description={
          isEditing
            ? `Editing ${employee.name}`
            : "Add a new team member to the roster"
        }
      />
      <div className="p-6">
        <EmployeeForm employee={employee} lcats={lcats} skills={skills} />
      </div>
    </div>
  );
}
