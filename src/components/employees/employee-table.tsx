"use client";

import Link from "next/link";
import { Employee, LCAT, Skill } from "@/types";
import { deleteEmployee } from "@/actions/employees";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmployeeTableProps {
  employees: Employee[];
  lcats: LCAT[];
  skills: Skill[];
}

export function EmployeeTable({ employees, lcats, skills }: EmployeeTableProps) {
  const getLCATName = (lcatId: string) => {
    const lcat = lcats.find((l) => l.id === lcatId);
    return lcat ? lcat.name : "Unknown";
  };

  const getSkillName = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    return skill ? skill.name : "Unknown";
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 0.75) return "bg-green-500";
    if (availability >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Labor Category</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{getLCATName(employee.lcatId)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {employee.skills.map((skillId) => (
                  <Badge key={skillId} variant="secondary">
                    {getSkillName(skillId)}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${getAvailabilityColor(
                    employee.availability
                  )}`}
                />
                <span>{Math.round(employee.availability * 100)}%</span>
              </div>
            </TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
