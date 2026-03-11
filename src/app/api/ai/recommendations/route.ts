import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildAiContext } from "@/lib/ai-context";
import { getProjects, getEmployees, getLCATs, getSkills, getAssignments } from "@/lib/data";
import { getCurrentAvailabilityFte } from "@/lib/availability";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

const SYSTEM_PROMPT = `You are an AI resource planning assistant for an engineering services firm.
You have access to current project data, employee roster, skills, and assignments.
Your job is to recommend the best employee assignments for unassigned LCAT requirements on active projects.

Rules:
- Only recommend employees whose LCAT matches the requirement's LCAT
- Prefer employees with higher availability
- Prefer employees with more matching skills
- Do not recommend employees already assigned to the same LCAT requirement
- Focus on preliminary, proposal_submitted, and awarded projects
- Prioritize high-priority projects, then by win probability

Return a JSON object with a single key "recommendations" containing an array of recommendation objects. Each object must have these exact fields:
{
  "projectId": string,
  "projectName": string,
  "priority": "high" | "medium" | "low",
  "lcatRequirementId": string,
  "lcatName": string,
  "recommendedEmployeeId": string,
  "employeeName": string,
  "rationale": string (1-2 sentences explaining the recommendation),
  "winProbability": number
}

Example format: {"recommendations": [{...}, {...}]}`;

export async function POST() {
  try {
    const context = buildAiContext();
    const projects = getProjects();
    const employees = getEmployees();
    const lcats = getLCATs();
    const skills = getSkills();
    const assignments = getAssignments();

    const lcatMap = new Map(lcats.map((l) => [l.id, l.name]));
    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

    // Build unassigned requirements context for the prompt
    const activeStatuses = ["preliminary", "proposal_submitted", "awarded"];
    const unassignedLines: string[] = [];

    for (const project of projects) {
      if (!activeStatuses.includes(project.status)) continue;
      for (const req of project.lcatRequirements) {
        const reqAssignments = assignments.filter(
          (a) => a.projectId === project.id && a.lcatRequirementId === req.id
        );
        const assignedCount = reqAssignments.length;
        if (assignedCount >= req.fteCount) continue;

        const assignedEmployeeIds = new Set(reqAssignments.map((a) => a.employeeId));
        const lcatName = lcatMap.get(req.lcatId) ?? req.lcatId;
        const reqSkills = req.requiredSkills.map((sid) => skillMap.get(sid) ?? sid);

        // Find eligible employees with availability > 0%
        const eligible = employees.filter(
          (e) =>
            e.lcatId === req.lcatId &&
            !assignedEmployeeIds.has(e.id) &&
            getCurrentAvailabilityFte(e.id, assignments) > 0
        );

        unassignedLines.push(
          `Project "${project.name}" (${project.priority ?? "medium"} priority, ${project.winProbability}% win prob) needs ${req.fteCount - assignedCount} more ${lcatName}. RequirementId: ${req.id}. Required skills: [${reqSkills.join(", ")}]. Eligible employees: [${eligible.map((e) => `${e.name} (id:${e.id}, avail:${Math.round(getCurrentAvailabilityFte(e.id, assignments) * 100)}%, skills:[${e.skills.map((sid) => skillMap.get(sid) ?? sid).join(", ")}])`).join("; ")}]`
        );
      }
    }

    if (unassignedLines.length === 0) {
      return NextResponse.json([]);
    }

    const userMessage = `Here is the current state of the workforce:\n\n${context}\n\n=== UNASSIGNED REQUIREMENTS ===\n${unassignedLines.join("\n")}\n\nPlease recommend the best employee for each unassigned requirement. Return one recommendation per requirement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json([]);
    }

    // Extract array from object wrapper if needed
    let recommendations: Recommendation[];
    if (Array.isArray(parsed)) {
      recommendations = parsed as Recommendation[];
    } else if (parsed && typeof parsed === "object") {
      const values = Object.values(parsed as Record<string, unknown>);
      const firstArray = values.find((v) => Array.isArray(v));
      recommendations = (firstArray as Recommendation[]) ?? [];
    } else {
      recommendations = [];
    }

    // Build lookup: requirementId → { requiredSkills: Set, project }
    const reqLookup = new Map<string, { requiredSkills: Set<string>; project: typeof projects[0] }>();
    for (const project of projects) {
      for (const req of project.lcatRequirements) {
        reqLookup.set(req.id, { requiredSkills: new Set(req.requiredSkills), project });
      }
    }
    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    // Overwrite skill/availability fields with server-computed values
    recommendations = recommendations.map((rec) => {
      const emp = employeeMap.get(rec.recommendedEmployeeId);
      const lookup = reqLookup.get(rec.lcatRequirementId);
      const totalSkillsRequired = lookup ? lookup.requiredSkills.size : 0;
      const skillMatchCount = emp && lookup
        ? emp.skills.filter((sid) => lookup.requiredSkills.has(sid)).length
        : 0;
      const availabilityPct = emp
        ? Math.round(getCurrentAvailabilityFte(emp.id, assignments) * 100)
        : 0;
      return { ...rec, skillMatchCount, totalSkillsRequired, availabilityPct };
    });

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
