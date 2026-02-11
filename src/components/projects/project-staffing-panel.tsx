"use client";

import { useState } from "react";
import { Project, Employee, LCAT, Skill, Assignment } from "@/types";
import { RequirementMatchingCard } from "./requirement-matching-card";

interface ProjectStaffingPanelProps {
  project: Project;
  employees: Employee[];
  lcats: LCAT[];
  skills: Skill[];
  assignments: Assignment[];
}

export function ProjectStaffingPanel({
  project,
  employees,
  lcats,
  skills,
  assignments,
}: ProjectStaffingPanelProps) {
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(
    new Set()
  );

  const toggleRequirement = (requirementId: string) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) {
        next.delete(requirementId);
      } else {
        next.add(requirementId);
      }
      return next;
    });
  };

  if (project.lcatRequirements.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Project Staffing</h2>
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            This project has no LCAT requirements defined. Add requirements to
            the project above to see employee matching and staffing options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Project Staffing</h2>
      <p className="text-sm text-muted-foreground">
        Match and assign employees to project requirements based on LCAT and skill compatibility.
      </p>
      {project.lcatRequirements.map((requirement) => (
        <RequirementMatchingCard
          key={requirement.id}
          requirement={requirement}
          projectId={project.id}
          employees={employees}
          lcats={lcats}
          skills={skills}
          assignments={assignments}
          isExpanded={expandedRequirements.has(requirement.id)}
          onToggleExpand={() => toggleRequirement(requirement.id)}
        />
      ))}
    </div>
  );
}
