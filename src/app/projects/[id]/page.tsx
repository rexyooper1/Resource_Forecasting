import { getProject, getLCATs, getSkills } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = getProject(params.id);
  const lcats = getLCATs();
  const skills = getSkills();

  if (!project) {
    return (
      <div>
        <Header title="Project Not Found" />
        <div className="p-6 text-muted-foreground">
          The project you are looking for does not exist.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={project.name}
        actions={<ProjectDeleteButton projectId={project.id} />}
      />
      <ProjectForm project={project} lcats={lcats} skills={skills} />
    </div>
  );
}
