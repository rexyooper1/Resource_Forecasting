import { Project, Assignment, LCAT } from "@/types";

const HOURS_PER_WEEK = 40;

export interface RequirementDemand {
  lcatId: string;
  requiredFte: number;
  assignedFte: number;
  unassignedFte: number;
}

export interface ProjectDemand {
  projectId: string;
  projectName: string;
  client: string;
  status: "preliminary" | "proposal_submitted";
  winProbability: number;
  requirements: RequirementDemand[];
  totalUnassignedFte: number;
}

export interface LCATAggregateDemand {
  lcatId: string;
  lcatName: string;
  projectCount: number;
  totalUnassignedFte: number;
}

export function calculateProjectUnassignedDemand(
  projects: Project[],
  assignments: Assignment[]
): ProjectDemand[] {
  const preAwardProjects = projects.filter(
    (p) => p.status === "preliminary" || p.status === "proposal_submitted"
  );

  const demands: ProjectDemand[] = [];

  for (const project of preAwardProjects) {
    const projectAssignments = assignments.filter(
      (a) => a.projectId === project.id
    );

    const requirements: RequirementDemand[] = project.lcatRequirements.map(
      (req) => {
        const assignedHours = projectAssignments
          .filter((a) => a.lcatRequirementId === req.id)
          .reduce((sum, a) => sum + a.hoursPerWeek, 0);
        const assignedFte = assignedHours / HOURS_PER_WEEK;
        const unassignedFte = Math.max(0, req.fteCount - assignedFte);

        return {
          lcatId: req.lcatId,
          requiredFte: req.fteCount,
          assignedFte: parseFloat(assignedFte.toFixed(1)),
          unassignedFte: parseFloat(unassignedFte.toFixed(1)),
        };
      }
    );

    const totalUnassignedFte = requirements.reduce(
      (sum, r) => sum + r.unassignedFte,
      0
    );

    if (totalUnassignedFte > 0) {
      demands.push({
        projectId: project.id,
        projectName: project.name,
        client: project.client,
        status: project.status as "preliminary" | "proposal_submitted",
        winProbability: project.winProbability,
        requirements,
        totalUnassignedFte: parseFloat(totalUnassignedFte.toFixed(1)),
      });
    }
  }

  return demands;
}

export function calculateLCATAggregateDemand(
  projectDemands: ProjectDemand[],
  lcats: LCAT[]
): LCATAggregateDemand[] {
  const lcatMap = new Map(lcats.map((l) => [l.id, l.name]));
  const aggregates = new Map<
    string,
    { totalUnassignedFte: number; projectIds: Set<string> }
  >();

  for (const pd of projectDemands) {
    for (const req of pd.requirements) {
      if (req.unassignedFte <= 0) continue;

      const existing = aggregates.get(req.lcatId);
      if (existing) {
        existing.totalUnassignedFte += req.unassignedFte;
        existing.projectIds.add(pd.projectId);
      } else {
        aggregates.set(req.lcatId, {
          totalUnassignedFte: req.unassignedFte,
          projectIds: new Set([pd.projectId]),
        });
      }
    }
  }

  const result: LCATAggregateDemand[] = [];
  aggregates.forEach((data, lcatId) => {
    result.push({
      lcatId,
      lcatName: lcatMap.get(lcatId) ?? lcatId,
      projectCount: data.projectIds.size,
      totalUnassignedFte: parseFloat(data.totalUnassignedFte.toFixed(1)),
    });
  });

  result.sort((a, b) => b.totalUnassignedFte - a.totalUnassignedFte);
  return result;
}

export function getActiveLCATIds(projectDemands: ProjectDemand[]): string[] {
  const ids = new Set<string>();
  for (const pd of projectDemands) {
    for (const req of pd.requirements) {
      if (req.unassignedFte > 0) {
        ids.add(req.lcatId);
      }
    }
  }
  return Array.from(ids);
}
