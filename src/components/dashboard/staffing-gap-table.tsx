"use client";

import { Project, Employee, LCAT, Assignment } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateCapacityByLCAT } from "@/lib/capacity";

interface StaffingGapTableProps {
  projects: Project[];
  employees: Employee[];
  lcats: LCAT[];
  assignments: Assignment[];
}

function getStatusBadge(gap: number) {
  if (gap <= -2) {
    return <Badge className="bg-red-900 text-red-200 hover:bg-red-900">Critical</Badge>;
  }
  if (gap < 0) {
    return <Badge className="bg-red-600 text-red-100 hover:bg-red-600">Deficit</Badge>;
  }
  if (gap < 0.5) {
    return <Badge className="bg-yellow-600 text-yellow-100 hover:bg-yellow-600">Balanced</Badge>;
  }
  return <Badge className="bg-green-600 text-green-100 hover:bg-green-600">Surplus</Badge>;
}

export function StaffingGapTable({
  projects,
  employees,
  lcats,
  assignments,
}: StaffingGapTableProps) {
  const capacityData = calculateCapacityByLCAT(projects, employees, lcats, assignments);
  const sorted = [...capacityData].sort((a, b) => a.gapFte - b.gapFte);

  const totals = sorted.reduce(
    (acc, row) => ({
      employeeCount: acc.employeeCount + row.employeeCount,
      capacityFte: acc.capacityFte + row.capacityFte,
      weightedDemandFte: acc.weightedDemandFte + row.weightedDemandFte,
      gapFte: acc.gapFte + row.gapFte,
    }),
    { employeeCount: 0, capacityFte: 0, weightedDemandFte: 0, gapFte: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Staffing Gap Analysis</CardTitle>
        <CardDescription>Rolling 6-month average demand vs. current capacity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 text-left font-medium">Labor Category</th>
                <th className="py-3 text-right font-medium">Employees</th>
                <th className="py-3 text-right font-medium">Available FTE</th>
                <th className="py-3 text-right font-medium">Weighted Demand</th>
                <th className="py-3 text-right font-medium">Gap</th>
                <th className="py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.lcatId} className="border-b border-border/50">
                  <td className="py-3 font-medium">{row.lcatName}</td>
                  <td className="py-3 text-right">{row.employeeCount}</td>
                  <td className="py-3 text-right">{row.capacityFte.toFixed(2)}</td>
                  <td className="py-3 text-right">{row.weightedDemandFte.toFixed(2)}</td>
                  <td
                    className={`py-3 text-right font-semibold ${
                      row.gapFte < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {row.gapFte > 0 ? "+" : ""}
                    {row.gapFte.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">{getStatusBadge(row.gapFte)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-3">Total</td>
                <td className="py-3 text-right">{totals.employeeCount}</td>
                <td className="py-3 text-right">{totals.capacityFte.toFixed(2)}</td>
                <td className="py-3 text-right">{totals.weightedDemandFte.toFixed(2)}</td>
                <td
                  className={`py-3 text-right ${
                    totals.gapFte < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {totals.gapFte > 0 ? "+" : ""}
                  {totals.gapFte.toFixed(2)}
                </td>
                <td className="py-3 text-right">
                  {getStatusBadge(totals.gapFte)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
