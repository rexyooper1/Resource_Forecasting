"use client";

import { Project, Employee, LCAT, Assignment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FolderKanban, Users, TrendingUp, CheckCircle } from "lucide-react";
import { calculateCapacityByLCAT } from "@/lib/capacity";

interface DemandSummaryProps {
  projects: Project[];
  employees: Employee[];
  lcats: LCAT[];
  assignments: Assignment[];
}

export function DemandSummary({ projects, employees, lcats, assignments }: DemandSummaryProps) {
  const activeProjects = projects.filter(
    (p) => p.status === "preliminary" || p.status === "proposal_submitted"
  );

  const totalPreliminary = activeProjects.length;

  const capacityData = calculateCapacityByLCAT(projects, employees, lcats, assignments);

  const totalFteDemand = capacityData.reduce(
    (sum, c) => sum + c.rawDemandFte,
    0
  );

  const weightedFteDemand = capacityData.reduce(
    (sum, c) => sum + c.weightedDemandFte,
    0
  );

  const awardedProjects = projects.filter(
    (p) => p.status === "awarded"
  ).length;

  const staffedProjects = projects.filter(
    (p) => p.status === "staffed"
  ).length;

  const cards = [
    {
      title: "Total Preliminary Projects",
      value: totalPreliminary,
      subtitle: null as string | null,
      icon: FolderKanban,
      iconColor: "text-orange-500",
    },
    {
      title: "Total FTE Demand",
      value: totalFteDemand.toFixed(1),
      subtitle: "Rolling 6-month average",
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Weighted FTE Demand",
      value: weightedFteDemand.toFixed(1),
      subtitle: "Rolling 6-month average",
      icon: TrendingUp,
      iconColor: "text-green-500",
    },
    {
      title: "Awarded Projects",
      value: awardedProjects,
      subtitle: null as string | null,
      icon: CheckCircle,
      iconColor: "text-emerald-500",
    },
  ];

  // If there are staffed projects, add a card for them
  if (staffedProjects > 0) {
    cards.push({
      title: "Staffed Projects",
      value: staffedProjects,
      subtitle: "Resources allocated",
      icon: CheckCircle,
      iconColor: "text-purple-500",
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
