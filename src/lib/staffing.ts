import { Project, Assignment } from "@/types";

const HOURS_PER_WEEK = 40;

export interface ProjectStaffingStatus {
  requiredFte: number;
  assignedFte: number;
  fulfillmentPercent: number;
  isFullyStaffed: boolean;
}

export function calculateProjectStaffing(
  project: Project,
  assignments: Assignment[]
): ProjectStaffingStatus {
  const requiredFte = project.lcatRequirements.reduce(
    (sum, req) => sum + req.fteCount,
    0
  );

  if (requiredFte === 0) {
    return { requiredFte: 0, assignedFte: 0, fulfillmentPercent: 100, isFullyStaffed: true };
  }

  const projectAssignments = assignments.filter(
    (a) => a.projectId === project.id
  );
  const assignedFte = projectAssignments.reduce(
    (sum, a) => sum + a.hoursPerWeek / HOURS_PER_WEEK,
    0
  );

  const fulfillmentPercent = Math.min(
    100,
    Math.round((assignedFte / requiredFte) * 100)
  );

  return {
    requiredFte,
    assignedFte: parseFloat(assignedFte.toFixed(1)),
    fulfillmentPercent,
    isFullyStaffed: fulfillmentPercent >= 100,
  };
}

export function calculateAllProjectStaffing(
  projects: Project[],
  assignments: Assignment[]
): Map<string, ProjectStaffingStatus> {
  const result = new Map<string, ProjectStaffingStatus>();
  for (const project of projects) {
    result.set(project.id, calculateProjectStaffing(project, assignments));
  }
  return result;
}
