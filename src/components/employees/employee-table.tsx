"use client";

import Link from "next/link";
import { Employee, LCAT, Assignment } from "@/types";
import { deleteEmployee } from "@/actions/employees";
import { getWeeklyAvailability } from "@/lib/availability";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface EmployeeTableProps {
  employees: Employee[];
  lcats: LCAT[];
  assignments: Assignment[];
}

export function EmployeeTable({ employees, lcats, assignments }: EmployeeTableProps) {
  const getLCATName = (lcatId: string) => {
    const lcat = lcats.find((l) => l.id === lcatId);
    return lcat ? lcat.name : "Unknown";
  };

  const getAvailabilityColor = (percent: number) => {
    if (percent >= 75) return "bg-green-600";
    if (percent >= 25) return "bg-yellow-600";
    if (percent > 0) return "bg-red-600";
    return "bg-red-900";
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  const sampleWeeks = getWeeklyAvailability(employees[0]?.id ?? "", assignments);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10">Name</TableHead>
            <TableHead>LCAT</TableHead>
            {sampleWeeks.map((week) => (
              <TableHead key={week.label} className="text-center px-1 min-w-[48px]">
                {week.label}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const weeks = getWeeklyAvailability(employee.id, assignments);
            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  {employee.name}
                </TableCell>
                <TableCell>{getLCATName(employee.lcatId)}</TableCell>
                {weeks.map((week) => (
                  <TableCell
                    key={week.label}
                    className="text-center px-1"
                    title={`Week of ${week.label}: ${week.assignedHours}h assigned, ${week.availableHours}h remaining`}
                  >
                    <span
                      className={`inline-block w-full rounded px-1 py-0.5 text-xs font-medium text-white ${getAvailabilityColor(week.percentAvailable)}`}
                    >
                      {week.percentAvailable}%
                    </span>
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/employees/new?id=${employee.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
