import { NextResponse } from "next/server";
import { getProjects, getEmployees, getLCATs, getAssignments } from "@/lib/data";
import { getCurrentAvailabilityFte } from "@/lib/availability";
import { matchEmployeesToRequirement } from "@/lib/matching";

export interface Recommendation {
  projectId: string;
  projectName: string;
  priority: string;
  lcatRequirementId: string;
  lcatName: string;
  recommendedEmployeeId: string;
  employeeName: string;
  rationale: string;
  availabilityPct: number;
  skillMatchCount: number;
  totalSkillsRequired: number;
  winProbability: number;
}

export async function POST() {
  try {
    const projects = getProjects();
    const employees = getEmployees();
    const lcats = getLCATs();
    const assignments = getAssignments();

    const lcatMap = new Map(lcats.map((l) => [l.id, l.name]));

    const activeStatuses = ["preliminary", "proposal_submitted", "awarded"];
    const recommendations: Recommendation[] = [];

    for (const project of projects) {
      if (!activeStatuses.includes(project.status)) continue;

      for (const req of project.lcatRequirements) {
        const reqAssignments = assignments.filter(
          (a) => a.projectId === project.id && a.lcatRequirementId === req.id
        );
        const assignedCount = reqAssignments.length;
        if (assignedCount >= req.fteCount) continue;

        const assignedEmployeeIds = new Set(reqAssignments.map((a) => a.employeeId));

        const eligible = employees.filter(
          (e) =>
            e.lcatId === req.lcatId &&
            !assignedEmployeeIds.has(e.id) &&
            getCurrentAvailabilityFte(e.id, assignments) > 0
        );

        if (eligible.length === 0) continue;

        // Sort by score descending, break ties by availability descending
        const matches = matchEmployeesToRequirement(eligible, req);
        matches.sort((a, b) => {
          if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
          return (
            getCurrentAvailabilityFte(b.employee.id, assignments) -
            getCurrentAvailabilityFte(a.employee.id, assignments)
          );
        });

        const top = matches[0];
        const emp = top.employee;
        const lcatName = lcatMap.get(req.lcatId) ?? req.lcatId;
        const availabilityPct = Math.round(getCurrentAvailabilityFte(emp.id, assignments) * 100);
        const skillMatchCount = top.skillMatchCount;
        const totalSkillsRequired = req.requiredSkills.length;

        let rationale: string;
        if (totalSkillsRequired === 0) {
          rationale = `Highest availability ${lcatName} at ${availabilityPct}%.`;
        } else if (skillMatchCount === totalSkillsRequired) {
          rationale = `Perfect skill match (${skillMatchCount}/${totalSkillsRequired}) with ${availabilityPct}% availability.`;
        } else {
          rationale = `Best available ${lcatName} with ${skillMatchCount}/${totalSkillsRequired} required skills and ${availabilityPct}% availability.`;
        }

        recommendations.push({
          projectId: project.id,
          projectName: project.name,
          priority: project.priority ?? "medium",
          lcatRequirementId: req.id,
          lcatName,
          recommendedEmployeeId: emp.id,
          employeeName: emp.name,
          rationale,
          availabilityPct,
          skillMatchCount,
          totalSkillsRequired,
          winProbability: project.winProbability,
        });
      }
    }

    // Sort: high → medium → low, then by win probability descending
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return b.winProbability - a.winProbability;
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
