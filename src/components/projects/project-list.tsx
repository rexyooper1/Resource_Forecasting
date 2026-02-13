"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { Project, Assignment } from "@/types";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectStaffingTable } from "@/components/projects/project-staffing-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ProjectListProps {
  projects: Project[];
  assignments: Assignment[];
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "preliminary", label: "Preliminary" },
  { value: "proposal_submitted", label: "Proposal Submitted" },
  { value: "awarded", label: "Awarded" },
  { value: "staffed", label: "Staffed" },
  { value: "lost", label: "Lost" },
] as const;

export function ProjectList({ projects, assignments }: ProjectListProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList>
            {statusFilters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("cards")}
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activeFilter === "all"
              ? "No projects found. Create your first project to get started."
              : `No projects with status "${statusFilters.find((f) => f.value === activeFilter)?.label}" found.`}
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <ProjectStaffingTable
          projects={filteredProjects}
          assignments={assignments}
        />
      )}
    </div>
  );
}
