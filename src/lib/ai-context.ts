import { getProjects, getEmployees, getLCATs, getSkills, getAssignments } from "@/lib/data";
import { getCurrentAvailabilityFte } from "@/lib/availability";
import { calculateProjectStaffing } from "@/lib/staffing";

export function buildAiContext(): string {
  const projects = getProjects();
  const employees = getEmployees();
  const lcats = getLCATs();
  const skills = getSkills();
  const assignments = getAssignments();

  const lcatMap = new Map(lcats.map((l) => [l.id, l.name]));
  const skillMap = new Map(skills.map((s) => [s.id, s.name]));

  const projectLines = projects.map((p) => {
    const staffing = calculateProjectStaffing(p, assignments);
    const reqs = p.lcatRequirements.map((req) => {
      const skillNames = req.requiredSkills.map((sid) => skillMap.get(sid) ?? sid).join(", ");
      return `    - ${req.fteCount} FTE ${lcatMap.get(req.lcatId) ?? req.lcatId}${skillNames ? ` (skills: ${skillNames})` : ""}`;
    });
    return [
      `  Project: ${p.name}`,
      `    Client: ${p.client}`,
      `    Status: ${p.status}`,
      `    Priority: ${p.priority ?? "medium"}`,
      `    Win Probability: ${p.winProbability}%`,
      `    Period: ${p.periodOfPerformance.startDate} to ${p.periodOfPerformance.endDate}`,
      `    Staffing fulfillment: ${staffing.fulfillmentPercent}% (${staffing.assignedFte}/${staffing.requiredFte} FTE)`,
      `    LCAT Requirements:`,
      ...reqs,
    ].join("\n");
  });

  const employeeLines = employees.map((e) => {
    const availFte = getCurrentAvailabilityFte(e.id, assignments);
    const availPct = Math.round(availFte * 100);
    const skillNames = e.skills.map((sid) => skillMap.get(sid) ?? sid).join(", ");
    return [
      `  Employee: ${e.name}`,
      `    LCAT: ${lcatMap.get(e.lcatId) ?? e.lcatId}`,
      `    Skills: ${skillNames || "none"}`,
      `    Current Availability: ${availPct}% (${availFte} FTE)`,
    ].join("\n");
  });

  const assignmentLines = assignments.map((a) => {
    const emp = employees.find((e) => e.id === a.employeeId);
    const proj = projects.find((p) => p.id === a.projectId);
    const req = proj?.lcatRequirements.find((r) => r.id === a.lcatRequirementId);
    const lcatName = req ? (lcatMap.get(req.lcatId) ?? req.lcatId) : "Unknown";
    return `  ${emp?.name ?? a.employeeId} → ${proj?.name ?? a.projectId} (${lcatName}) — ${a.hoursPerWeek} hrs/week`;
  });

  return [
    "=== PROJECTS ===",
    projectLines.join("\n\n"),
    "",
    "=== EMPLOYEES ===",
    employeeLines.join("\n\n"),
    "",
    "=== CURRENT ASSIGNMENTS ===",
    assignmentLines.join("\n") || "  (none)",
  ].join("\n");
}
