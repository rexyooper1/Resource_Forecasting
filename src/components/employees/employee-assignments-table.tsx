"use client";

import { useState } from "react";
import Link from "next/link";
import { Assignment, Project, LCAT, Skill } from "@/types";
import { deleteAssignment } from "@/actions/assignments";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmployeeAssignmentsTableProps {
  assignments: Assignment[];
  projects: Project[];
  lcats: LCAT[];
  skills: Skill[];
}

export function EmployeeAssignmentsTable({
  assignments,
  projects,
  lcats,
  skills,
}: EmployeeAssignmentsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAssignment(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No active assignments</p>
            <Link href="/matching">
              <Button variant="outline">Assign to Project</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments ({assignments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>LCAT Requirement</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Hours/Week</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const project = projects.find((p) => p.id === assignment.projectId);
                const requirement = project?.lcatRequirements.find(
                  (r) => r.id === assignment.lcatRequirementId
                );
                const lcat = lcats.find((l) => l.id === requirement?.lcatId);
                const requiredSkills = skills.filter((s) =>
                  requirement?.requiredSkills.includes(s.id)
                );
                const ftePercent = Math.round((assignment.hoursPerWeek / 40) * 100);

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {project ? (
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>{lcat?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {requiredSkills.length > 0 ? (
                          requiredSkills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{assignment.hoursPerWeek}h</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({ftePercent}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(assignment.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(assignment.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                        disabled={deletingId === assignment.id}
                      >
                        {deletingId === assignment.id ? "Removing..." : "Remove"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
