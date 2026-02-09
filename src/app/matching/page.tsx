import { getProjects, getEmployees, getLCATs, getSkills } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { SkillMatchTable } from "@/components/matching/skill-match-table";

export default function MatchingPage() {
  const projects = getProjects();
  const employees = getEmployees();
  const lcats = getLCATs();
  const skills = getSkills();

  return (
    <div>
      <Header
        title="Skill Matching"
        description="Match employees to project requirements"
      />
      <div className="p-6">
        <SkillMatchTable
          projects={projects}
          employees={employees}
          lcats={lcats}
          skills={skills}
        />
      </div>
    </div>
  );
}
