import { getEmployees, getLCATs, getAssignments } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmployeesPage() {
  const employees = getEmployees();
  const lcats = getLCATs();
  const assignments = getAssignments();

  return (
    <div>
      <Header
        title="Employee Roster"
        description="Manage your engineering team"
        actions={
          <Link href="/employees/new">
            <Button>Add Employee</Button>
          </Link>
        }
      />
      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No employees found. Add your first employee to get started.
            </p>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            lcats={lcats}
            assignments={assignments}
          />
        )}
      </div>
    </div>
  );
}
