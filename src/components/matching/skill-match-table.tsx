"use client";

import { useState } from "react";
import { Project, Employee, LCAT, Skill, Assignment } from "@/types";
import { matchEmployeesToRequirement, getSkillGaps } from "@/lib/matching";
import { getCurrentAvailabilityFte } from "@/lib/availability";
import { createAssignment, deleteAssignment } from "@/actions/assignments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface SkillMatchTableProps {
  projects: Project[];
  employees: Employee[];
  lcats: LCAT[];
  skills: Skill[];
  assignments: Assignment[];
}

export function SkillMatchTable({
  projects,
  employees,
  lcats,
  skills,
  assignments,
}: SkillMatchTableProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const getLcatName = (lcatId: string) => {
    return lcats.find((l) => l.id === lcatId)?.name ?? "Unknown LCAT";
  };

  const getSkillName = (skillId: string) => {
    return skills.find((s) => s.id === skillId)?.name ?? "Unknown Skill";
  };

  const toggleRequirement = (requirementId: string) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) {
        next.delete(requirementId);
      } else {
        next.add(requirementId);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getAssignedCount = (requirementId: string) => {
    return assignments.filter((a) => a.lcatRequirementId === requirementId).length;
  };

  const getEmployeeAssignment = (employeeId: string, requirementId: string) => {
    return assignments.find(
      (a) => a.employeeId === employeeId && a.lcatRequirementId === requirementId
    );
  };

  const handleAssign = async (employeeId: string, projectId: string, requirementId: string) => {
    setLoading(`${employeeId}-${requirementId}`);
    try {
      await createAssignment({
        employeeId,
        projectId,
        lcatRequirementId: requirementId,
      });
    } catch (error) {
      console.error("Failed to assign:", error);
    }
    setLoading(null);
  };

  const handleUnassign = async (assignmentId: string, employeeId: string, requirementId: string) => {
    setLoading(`${employeeId}-${requirementId}`);
    try {
      await deleteAssignment(assignmentId);
    } catch (error) {
      console.error("Failed to unassign:", error);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Select a Project
        </label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {project.client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && selectedProject.lcatRequirements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            This project has no LCAT requirements defined. Add requirements to
            the project to see skill matching results.
          </p>
        </div>
      )}

      {selectedProject &&
        selectedProject.lcatRequirements.map((requirement) => {
          const isExpanded = expandedRequirements.has(requirement.id);
          const matches = matchEmployeesToRequirement(employees, requirement);
          const gaps = getSkillGaps(employees, requirement);
          const assignedCount = getAssignedCount(requirement.id);
          const isFullyStaffed = assignedCount >= Math.ceil(requirement.fteCount);

          return (
            <Card key={requirement.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {getLcatName(requirement.lcatId)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({requirement.fteCount} FTE
                      {requirement.fteCount !== 1 ? "s" : ""} needed
                      {requirement.requiredSkills.length > 0
                        ? ` / ${requirement.requiredSkills.length} skill${requirement.requiredSkills.length !== 1 ? "s" : ""} required`
                        : ""}
                      )
                    </span>
                    <span className={`ml-2 text-sm font-medium ${isFullyStaffed ? "text-green-500" : "text-orange-500"}`}>
                      {assignedCount} assigned / {Math.ceil(requirement.fteCount)} needed
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRequirement(requirement.id)}
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No employees available for matching.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>LCAT Match</TableHead>
                          <TableHead>Skills Matched</TableHead>
                          <TableHead>Match Score</TableHead>
                          <TableHead>Matched Skills</TableHead>
                          <TableHead>Missing Skills</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.map((match) => {
                          const existingAssignment = getEmployeeAssignment(
                            match.employee.id,
                            requirement.id
                          );
                          const isAssigned = !!existingAssignment;
                          const isLoading = loading === `${match.employee.id}-${requirement.id}`;
                          const availabilityPct = Math.round(
                            getCurrentAvailabilityFte(match.employee.id, assignments) * 100
                          );

                          return (
                            <TableRow key={match.employee.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{match.employee.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {availabilityPct}% available
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {match.lcatMatch ? (
                                  <span className="text-green-600 font-bold">
                                    &#10003;
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-bold">
                                    &#10005;
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {match.totalRequiredSkills > 0
                                  ? `${match.skillMatchCount}/${match.totalRequiredSkills}`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`font-semibold ${getScoreColor(match.overallScore)} ${getScoreBgColor(match.overallScore)} px-2 py-1 rounded`}
                                >
                                  {Math.round(match.overallScore)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {match.matchedSkills.length > 0 ? (
                                    match.matchedSkills.map((skillId) => (
                                      <Badge
                                        key={skillId}
                                        className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                                      >
                                        {getSkillName(skillId)}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      None
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {match.missingSkills.length > 0 ? (
                                    match.missingSkills.map((skillId) => (
                                      <Badge
                                        key={skillId}
                                        variant="destructive"
                                        className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                                      >
                                        {getSkillName(skillId)}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      None
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {isAssigned ? (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() =>
                                      handleUnassign(
                                        existingAssignment.id,
                                        match.employee.id,
                                        requirement.id
                                      )
                                    }
                                  >
                                    {isLoading ? "..." : "Unassign"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={isLoading || isFullyStaffed}
                                    onClick={() =>
                                      handleAssign(
                                        match.employee.id,
                                        selectedProject.id,
                                        requirement.id
                                      )
                                    }
                                  >
                                    {isLoading ? "..." : "Assign"}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}

                  {gaps.length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-orange-800 mb-2">
                        Skill Gaps - No employee has these skills:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {gaps.map((skillId) => (
                          <Badge
                            key={skillId}
                            className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
                          >
                            {getSkillName(skillId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

      {!selectedProjectId && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Select a project above to view skill matching results.
          </p>
        </div>
      )}
    </div>
  );
}
