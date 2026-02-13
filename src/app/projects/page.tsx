import Link from "next/link";
import { getProjects, getAssignments } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  const projects = getProjects();
  const assignments = getAssignments();

  return (
    <div>
      <Header
        title="Projects"
        actions={
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <ProjectList projects={projects} assignments={assignments} />
      </div>
    </div>
  );
}
