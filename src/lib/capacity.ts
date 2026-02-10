import { Project, Employee, LCAT, Assignment } from "@/types";
import { startOfMonth, addMonths, isBefore, isAfter, parseISO } from "date-fns";
import { getCurrentAvailabilityFte } from "@/lib/availability";

export interface LCATCapacity {
  lcatId: string;
  lcatName: string;
  capacityFte: number;
  rawDemandFte: number;
  weightedDemandFte: number;
  gapFte: number;
  employeeCount: number;
}

function projectOverlapsMonth(project: Project, monthStart: Date, monthEnd: Date): boolean {
  const popStart = parseISO(project.periodOfPerformance.startDate);
  const popEnd = parseISO(project.periodOfPerformance.endDate);
  return !isAfter(popStart, monthEnd) && !isBefore(popEnd, monthStart);
}

export function calculateCapacityByLCAT(
  projects: Project[],
  employees: Employee[],
  lcats: LCAT[],
  assignments: Assignment[]
): LCATCapacity[] {
  const activeProjects = projects.filter(
    (p) => p.status === "preliminary" || p.status === "proposal_submitted"
  );

  const now = new Date();
  const months: { start: Date; end: Date }[] = [];
  for (let i = 0; i < 6; i++) {
    const start = startOfMonth(addMonths(now, i));
    const end = startOfMonth(addMonths(now, i + 1));
    months.push({ start, end });
  }

  return lcats.map((lcat) => {
    const lcatEmployees = employees.filter((e) => e.lcatId === lcat.id);
    const capacityFte = lcatEmployees.reduce(
      (sum, e) => sum + getCurrentAvailabilityFte(e.id, assignments),
      0
    );

    let totalRaw = 0;
    let totalWeighted = 0;

    for (const month of months) {
      activeProjects.forEach((project) => {
        if (!projectOverlapsMonth(project, month.start, month.end)) return;
        project.lcatRequirements.forEach((req) => {
          if (req.lcatId === lcat.id) {
            totalRaw += req.fteCount;
            totalWeighted += req.fteCount * (project.winProbability / 100);
          }
        });
      });
    }

    const rawDemandFte = totalRaw / 6;
    const weightedDemandFte = totalWeighted / 6;

    return {
      lcatId: lcat.id,
      lcatName: lcat.name,
      capacityFte: parseFloat(capacityFte.toFixed(2)),
      rawDemandFte: parseFloat(rawDemandFte.toFixed(2)),
      weightedDemandFte: parseFloat(weightedDemandFte.toFixed(2)),
      gapFte: parseFloat((capacityFte - weightedDemandFte).toFixed(2)),
      employeeCount: lcatEmployees.length,
    };
  });
}

export function getTotalCapacity(employees: Employee[], assignments: Assignment[]): number {
  return parseFloat(
    employees
      .reduce((sum, e) => sum + getCurrentAvailabilityFte(e.id, assignments), 0)
      .toFixed(2)
  );
}

export function getOverallUtilization(
  projects: Project[],
  employees: Employee[],
  lcats: LCAT[],
  assignments: Assignment[]
): number {
  const capacity = getTotalCapacity(employees, assignments);
  if (capacity === 0) return 0;

  const capacityData = calculateCapacityByLCAT(projects, employees, lcats, assignments);
  const totalWeightedDemand = capacityData.reduce(
    (sum, c) => sum + c.weightedDemandFte,
    0
  );

  return parseFloat(((totalWeightedDemand / capacity) * 100).toFixed(1));
}
