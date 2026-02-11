"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getAssignments, saveAssignments, getProject } from "@/lib/data";
import { Assignment } from "@/types";
import { calculateDefaultHours } from "@/lib/availability";

export interface CreateAssignmentData {
  employeeId: string;
  projectId: string;
  lcatRequirementId: string;
}

export async function createAssignment(data: CreateAssignmentData) {
  const assignments = getAssignments();
  const project = getProject(data.projectId);
  if (!project) throw new Error("Project not found");

  const requirement = project.lcatRequirements.find(
    (r) => r.id === data.lcatRequirementId
  );
  if (!requirement) throw new Error("LCAT requirement not found");

  const existingCount = assignments.filter(
    (a) =>
      a.projectId === data.projectId &&
      a.lcatRequirementId === data.lcatRequirementId
  ).length;

  const hoursPerWeek = calculateDefaultHours(
    requirement.fteCount,
    existingCount
  );

  const newAssignment: Assignment = {
    id: uuidv4(),
    employeeId: data.employeeId,
    projectId: data.projectId,
    lcatRequirementId: data.lcatRequirementId,
    hoursPerWeek,
    startDate: project.periodOfPerformance.startDate,
    endDate: project.periodOfPerformance.endDate,
    createdAt: new Date().toISOString(),
  };

  assignments.push(newAssignment);
  saveAssignments(assignments);
  revalidatePath("/matching");
  revalidatePath("/employees");
  revalidatePath("/dashboard");
  return newAssignment;
}

export async function deleteAssignment(id: string) {
  const assignments = getAssignments();
  const assignment = assignments.find((a) => a.id === id);
  const filtered = assignments.filter((a) => a.id !== id);
  saveAssignments(filtered);
  revalidatePath("/matching");
  revalidatePath("/employees");
  revalidatePath("/dashboard");
  if (assignment) {
    revalidatePath(`/employees/${assignment.employeeId}`);
  }
}
