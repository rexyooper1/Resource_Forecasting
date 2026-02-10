"use client";

import { Project, Employee, LCAT, Assignment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
  calculateCapacityByLCAT,
  getTotalCapacity,
  getOverallUtilization,
} from "@/lib/capacity";

interface CapacitySummaryProps {
  projects: Project[];
  employees: Employee[];
  lcats: LCAT[];
  assignments: Assignment[];
}

export function CapacitySummary({
  projects,
  employees,
  lcats,
  assignments,
}: CapacitySummaryProps) {
  const capacityData = calculateCapacityByLCAT(projects, employees, lcats, assignments);
  const totalCapacity = getTotalCapacity(employees, assignments);
  const utilization = getOverallUtilization(projects, employees, lcats, assignments);

  const mostCritical = [...capacityData].sort((a, b) => a.gapFte - b.gapFte)[0];
  const largestSurplus = [...capacityData].sort((a, b) => b.gapFte - a.gapFte)[0];

  const utilizationColor =
    utilization > 100
      ? "text-red-500"
      : utilization >= 80
        ? "text-yellow-500"
        : "text-green-500";

  const cards = [
    {
      title: "Total Available Capacity",
      value: `${totalCapacity.toFixed(2)} FTE`,
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Overall Utilization",
      value: `${utilization}%`,
      icon: Gauge,
      iconColor: utilizationColor,
    },
    {
      title: "Most Critical Gap",
      value: mostCritical
        ? `${mostCritical.lcatName}: ${mostCritical.gapFte > 0 ? "+" : ""}${mostCritical.gapFte.toFixed(2)} FTE`
        : "N/A",
      icon: TrendingDown,
      iconColor: "text-red-500",
    },
    {
      title: "Largest Surplus",
      value: largestSurplus
        ? `${largestSurplus.lcatName}: ${largestSurplus.gapFte > 0 ? "+" : ""}${largestSurplus.gapFte.toFixed(2)} FTE`
        : "N/A",
      icon: TrendingUp,
      iconColor: "text-green-500",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Rolling 6-month average demand vs. current capacity</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
