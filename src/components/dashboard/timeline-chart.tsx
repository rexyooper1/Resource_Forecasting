"use client";

import { Project, Employee, LCAT, Assignment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { getTotalCapacity } from "@/lib/capacity";

interface TimelineChartProps {
  projects: Project[];
  lcats: LCAT[];
  employees: Employee[];
  assignments: Assignment[];
}

const AREA_COLORS = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
  "#6366f1",
  "#84cc16",
];

export function TimelineChart({ projects, lcats, employees, assignments }: TimelineChartProps) {
  const activeProjects = projects.filter(
    (p) => p.status === "preliminary" || p.status === "proposal_submitted"
  );

  const totalCapacity = getTotalCapacity(employees, assignments);

  // Determine which LCATs are actually used in active projects
  const usedLcatIds = new Set<string>();
  activeProjects.forEach((project) => {
    project.lcatRequirements.forEach((req) => {
      usedLcatIds.add(req.lcatId);
    });
  });
  const usedLcats = lcats.filter((lcat) => usedLcatIds.has(lcat.id));

  // Generate 12 months starting from now
  const now = new Date();
  const months: Date[] = [];
  for (let i = 0; i < 12; i++) {
    months.push(addMonths(startOfMonth(now), i));
  }

  const chartData = months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const label = format(month, "MMM yyyy");

    const dataPoint: Record<string, string | number> = { month: label };

    usedLcats.forEach((lcat) => {
      let weightedFte = 0;

      activeProjects.forEach((project) => {
        const popStart = parseISO(project.periodOfPerformance.startDate);
        const popEnd = parseISO(project.periodOfPerformance.endDate);

        // Check if this project's period of performance overlaps with this month
        const overlaps =
          popStart <= monthEnd && popEnd >= monthStart;

        if (overlaps) {
          project.lcatRequirements.forEach((req) => {
            if (req.lcatId === lcat.id) {
              weightedFte +=
                req.fteCount * (project.winProbability / 100);
            }
          });
        }
      });

      dataPoint[lcat.name] = parseFloat(weightedFte.toFixed(2));
    });

    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Demand Timeline vs. Capacity (Weighted FTE)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {usedLcats.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No demand data available for active projects.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#888", fontSize: 12 }}
                stroke="#888"
              />
              <YAxis tick={{ fill: "#888" }} stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Legend />
              {usedLcats.map((lcat, index) => (
                <Area
                  key={lcat.id}
                  type="monotone"
                  dataKey={lcat.name}
                  stackId="1"
                  stroke={AREA_COLORS[index % AREA_COLORS.length]}
                  fill={AREA_COLORS[index % AREA_COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
              <ReferenceLine
                y={totalCapacity}
                stroke="#22c55e"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{
                  value: `Total Capacity: ${totalCapacity} FTE`,
                  position: "right",
                  fill: "#22c55e",
                  fontSize: 12,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
