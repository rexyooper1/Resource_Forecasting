"use client";

import { Project, Employee, LCAT, Assignment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculateCapacityByLCAT } from "@/lib/capacity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DemandChartProps {
  projects: Project[];
  lcats: LCAT[];
  employees: Employee[];
  assignments: Assignment[];
}

export function DemandChart({ projects, lcats, employees, assignments }: DemandChartProps) {
  const capacityData = calculateCapacityByLCAT(projects, employees, lcats, assignments);

  const chartData = capacityData.map((row) => {
    const gap = row.capacityFte - row.weightedDemandFte;
    return {
      name: row.lcatName,
      "Raw FTE Demand": row.rawDemandFte,
      "Weighted FTE Demand": row.weightedDemandFte,
      "Available Capacity": row.capacityFte,
      "Staffing Gap": parseFloat(Math.abs(gap).toFixed(2)),
      _gapPositive: gap >= 0,
    };
  });

  // Show LCATs that have demand OR employees
  const filteredData = chartData.filter(
    (d) =>
      d["Raw FTE Demand"] > 0 ||
      d["Weighted FTE Demand"] > 0 ||
      d["Available Capacity"] > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Demand vs. Capacity by Labor Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No demand data available for active projects.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#888", fontSize: 12 }}
                stroke="#888"
                interval={0}
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
              <Bar
                dataKey="Raw FTE Demand"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Weighted FTE Demand"
                fill="#fdba74"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Available Capacity"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Staffing Gap"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry._gapPositive ? "#4ade80" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
