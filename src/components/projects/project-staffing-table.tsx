"use client";

import Link from "next/link";
import type { Project, Assignment, ProjectStatus } from "@/types";
import { calculateAllProjectStaffing } from "@/lib/staffing";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProjectStaffingTableProps {
  projects: Project[];
  assignments: Assignment[];
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
  staffed: {
    label: "Staffed",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  lost: {
    label: "Lost",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

function getProgressColor(percent: number): string {
  if (percent >= 100) return "bg-green-500";
  if (percent >= 50) return "bg-yellow-500";
  if (percent > 0) return "bg-orange-500";
  return "bg-muted-foreground/30";
}

export function ProjectStaffingTable({
  projects,
  assignments,
}: ProjectStaffingTableProps) {
  const staffingMap = calculateAllProjectStaffing(projects, assignments);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Win %</TableHead>
            <TableHead className="text-right">Required FTE</TableHead>
            <TableHead className="text-right">Assigned FTE</TableHead>
            <TableHead className="w-[180px]">Staffing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const staffing = staffingMap.get(project.id)!;
              const config = statusConfig[project.status];
              const progressColor = getProgressColor(staffing.fulfillmentPercent);

              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.client}
                  </TableCell>
                  <TableCell>
                    <Badge className={config.className}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {project.winProbability}%
                  </TableCell>
                  <TableCell className="text-right">
                    {staffing.requiredFte.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {staffing.assignedFte.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressColor}`}
                          style={{ width: `${Math.min(100, staffing.fulfillmentPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-9 text-right">
                        {staffing.fulfillmentPercent}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
