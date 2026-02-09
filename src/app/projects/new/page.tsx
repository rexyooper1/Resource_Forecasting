import { getLCATs, getSkills } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  const lcats = getLCATs();
  const skills = getSkills();

  return (
    <div>
      <Header title="New Project" />
      <ProjectForm lcats={lcats} skills={skills} />
    </div>
  );
}
