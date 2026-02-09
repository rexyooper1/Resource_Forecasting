import { Employee, LCATRequirement } from "@/types";

export interface MatchResult {
  employee: Employee;
  lcatMatch: boolean;
  skillMatchCount: number;
  totalRequiredSkills: number;
  skillMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  overallScore: number;
}

export function matchEmployeesToRequirement(
  employees: Employee[],
  requirement: LCATRequirement
): MatchResult[] {
  return employees
    .map((employee) => {
      const lcatMatch = employee.lcatId === requirement.lcatId;
      const matchedSkills = requirement.requiredSkills.filter((skillId) =>
        employee.skills.includes(skillId)
      );
      const missingSkills = requirement.requiredSkills.filter(
        (skillId) => !employee.skills.includes(skillId)
      );
      const totalRequiredSkills = requirement.requiredSkills.length;
      const skillMatchPercentage =
        totalRequiredSkills > 0
          ? (matchedSkills.length / totalRequiredSkills) * 100
          : 100;

      // Score: 50% for LCAT match + 50% for skill match percentage
      const overallScore =
        (lcatMatch ? 50 : 0) + (skillMatchPercentage / 100) * 50;

      return {
        employee,
        lcatMatch,
        skillMatchCount: matchedSkills.length,
        totalRequiredSkills,
        skillMatchPercentage,
        matchedSkills,
        missingSkills,
        overallScore,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

export function getSkillGaps(
  employees: Employee[],
  requirement: LCATRequirement
): string[] {
  const allEmployeeSkills = new Set(employees.flatMap((e) => e.skills));
  return requirement.requiredSkills.filter(
    (skillId) => !allEmployeeSkills.has(skillId)
  );
}
