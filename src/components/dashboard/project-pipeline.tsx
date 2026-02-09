"use client";

import { Project, ProjectStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProjectPipelineProps {
  projects: Project[];
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  preliminary: {
    label: "Preliminary",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  proposal_submitted: {
    label: "Proposal Submitted",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  awarded: {
    label: "Awarded",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  lost: {
    label: "Lost",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

const statusOrder: ProjectStatus[] = [
  "preliminary",
  "proposal_submitted",
  "awarded",
  "lost",
];

export function ProjectPipeline({ projects }: ProjectPipelineProps) {
  const pipelineData = statusOrder.map((status) => {
    const statusProjects = projects.filter((p) => p.status === status);
    const projectCount = statusProjects.length;

    const totalFte = statusProjects.reduce((sum, project) => {
      return (
        sum +
        project.lcatRequirements.reduce(
          (fteSum, req) => fteSum + req.fteCount,
          0
        )
      );
    }, 0);

    const weightedFte = statusProjects.reduce((sum, project) => {
      return (
        sum +
        project.lcatRequirements.reduce(
          (fteSum, req) =>
            fteSum + req.fteCount * (project.winProbability / 100),
          0
        )
      );
    }, 0);

    return {
      status,
      projectCount,
      totalFte,
      weightedFte,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Projects</TableHead>
              <TableHead className="text-right">Total FTEs</TableHead>
              <TableHead className="text-right">Weighted FTEs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pipelineData.map((row) => {
              const config = statusConfig[row.status];
              return (
                <TableRow key={row.status}>
                  <TableCell>
                    <Badge className={config.className}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.projectCount}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.totalFte.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.weightedFte.toFixed(1)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
