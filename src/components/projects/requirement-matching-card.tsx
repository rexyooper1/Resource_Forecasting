"use client";

import { useState } from "react";
import { Employee, LCAT, Skill, Assignment, LCATRequirement } from "@/types";
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

interface RequirementMatchingCardProps {
  requirement: LCATRequirement;
  projectId: string;
  employees: Employee[];
  lcats: LCAT[];
  skills: Skill[];
  assignments: Assignment[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function RequirementMatchingCard({
  requirement,
  projectId,
  employees,
  lcats,
  skills,
  assignments,
  isExpanded,
  onToggleExpand,
}: RequirementMatchingCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getLcatName = (lcatId: string) => {
    return lcats.find((l) => l.id === lcatId)?.name ?? "Unknown LCAT";
  };

  const getSkillName = (skillId: string) => {
    return skills.find((s) => s.id === skillId)?.name ?? "Unknown Skill";
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

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 75) return "text-green-600";
    if (availability >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  const getAssignedCount = () => {
    return assignments.filter((a) => a.lcatRequirementId === requirement.id).length;
  };

  const getEmployeeAssignment = (employeeId: string) => {
    return assignments.find(
      (a) => a.employeeId === employeeId && a.lcatRequirementId === requirement.id
    );
  };

  const handleAssign = async (employeeId: string) => {
    setLoading(employeeId);
    try {
      await createAssignment({
        employeeId,
        projectId,
        lcatRequirementId: requirement.id,
      });
    } catch (error) {
      console.error("Failed to assign:", error);
    }
    setLoading(null);
  };

  const handleUnassign = async (assignmentId: string, employeeId: string) => {
    setLoading(employeeId);
    try {
      await deleteAssignment(assignmentId);
    } catch (error) {
      console.error("Failed to unassign:", error);
    }
    setLoading(null);
  };

  const matches = matchEmployeesToRequirement(employees, requirement);
  const gaps = getSkillGaps(employees, requirement);
  const assignedCount = getAssignedCount();
  const isFullyStaffed = assignedCount >= Math.ceil(requirement.fteCount);

  return (
    <Card>
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
            onClick={onToggleExpand}
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
            <div className="overflow-x-auto">
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
                      match.employee.id
                    );
                    const isAssigned = !!existingAssignment;
                    const isLoading = loading === match.employee.id;
                    const availabilityPct = Math.round(
                      getCurrentAvailabilityFte(match.employee.id, assignments) * 100
                    );

                    return (
                      <TableRow key={match.employee.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{match.employee.name}</span>
                            <span className={`text-xs ${getAvailabilityColor(availabilityPct)}`}>
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
                                  match.employee.id
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
                                handleAssign(match.employee.id)
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
            </div>
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
}
