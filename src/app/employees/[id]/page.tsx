import { getEmployee, getAssignments, getProjects, getLCATs, getSkills } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { EmployeeDetailCard } from "@/components/employees/employee-detail-card";
import { EmployeeAvailabilityChart } from "@/components/employees/employee-availability-chart";
import { EmployeeAssignmentsTable } from "@/components/employees/employee-assignments-table";

interface EmployeeDetailPageProps {
  params: { id: string };
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const employee = getEmployee(params.id);
  const allAssignments = getAssignments();
  const projects = getProjects();
  const lcats = getLCATs();
  const skills = getSkills();

  if (!employee) {
    return (
      <div>
        <Header title="Employee Not Found" />
        <div className="p-6 text-muted-foreground">
          The employee you are looking for does not exist.
        </div>
      </div>
    );
  }

  // Filter assignments for this employee
  const employeeAssignments = allAssignments.filter(
    (a) => a.employeeId === params.id
  );

  return (
    <div>
      <Header title={employee.name} />
      <div className="p-6 space-y-6">
        <EmployeeDetailCard
          employee={employee}
          lcats={lcats}
          skills={skills}
        />
        <EmployeeAvailabilityChart
          employeeId={employee.id}
          assignments={allAssignments}
        />
        <EmployeeAssignmentsTable
          assignments={employeeAssignments}
          projects={projects}
          lcats={lcats}
          skills={skills}
        />
      </div>
    </div>
  );
}
