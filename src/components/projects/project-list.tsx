"use client";

import { useState } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/projects/project-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectListProps {
  projects: Project[];
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "preliminary", label: "Preliminary" },
  { value: "proposal_submitted", label: "Proposal Submitted" },
  { value: "awarded", label: "Awarded" },
  { value: "lost", label: "Lost" },
] as const;

export function ProjectList({ projects }: ProjectListProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  return (
    <div className="space-y-6">
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList>
          {statusFilters.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activeFilter === "all"
              ? "No projects found. Create your first project to get started."
              : `No projects with status "${statusFilters.find((f) => f.value === activeFilter)?.label}" found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
