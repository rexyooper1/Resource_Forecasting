"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { Project } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<Project["status"], string> = {
  preliminary: "bg-yellow-100 text-yellow-800 border-yellow-300",
  proposal_submitted: "bg-blue-100 text-blue-800 border-blue-300",
  awarded: "bg-green-100 text-green-800 border-green-300",
  lost: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<Project["status"], string> = {
  preliminary: "Preliminary",
  proposal_submitted: "Proposal Submitted",
  awarded: "Awarded",
  lost: "Lost",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const totalFTEs = project.lcatRequirements.reduce(
    (sum, req) => sum + req.fteCount,
    0
  );
  const lcatCount = project.lcatRequirements.length;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="mt-1">
                {project.client}
              </CardDescription>
            </div>
            <Badge className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Probability</span>
              <span className="font-medium">{project.winProbability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Period of Performance
              </span>
              <span className="font-medium">
                {format(
                  new Date(project.periodOfPerformance.startDate),
                  "MMM d, yyyy"
                )}{" "}
                -{" "}
                {format(
                  new Date(project.periodOfPerformance.endDate),
                  "MMM d, yyyy"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LCAT Requirements</span>
              <span className="font-medium">
                {lcatCount} LCAT{lcatCount !== 1 ? "s" : ""}, {totalFTEs} FTE
                {totalFTEs !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
