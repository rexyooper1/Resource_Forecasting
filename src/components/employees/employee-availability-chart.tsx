import { Assignment } from "@/types";
import { getWeeklyAvailability } from "@/lib/availability";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface EmployeeAvailabilityChartProps {
  employeeId: string;
  assignments: Assignment[];
}

export function EmployeeAvailabilityChart({
  employeeId,
  assignments
}: EmployeeAvailabilityChartProps) {
  const weeks = getWeeklyAvailability(employeeId, assignments);
  const currentWeek = weeks[0];

  const getAvailabilityColor = (percent: number) => {
    if (percent >= 75) return "bg-green-600";
    if (percent >= 25) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Week Availability Forecast</CardTitle>
        <CardDescription>
          Current week: {currentWeek.percentAvailable}% available ({currentWeek.availableHours}h / 40h)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-48 flex items-end justify-between gap-2">
            {weeks.map((week) => {
              const barHeight = Math.max(week.percentAvailable, 2); // Minimum 2% for visibility
              return (
                <div
                  key={week.label}
                  className="flex-1 flex flex-col items-center justify-end gap-2"
                  title={`Week of ${week.label}: ${week.assignedHours}h assigned, ${week.availableHours}h available (${week.percentAvailable}% free)`}
                >
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: "160px" }}>
                    <div
                      className={`w-full rounded-t transition-all ${getAvailabilityColor(week.percentAvailable)}`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{week.label}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600" />
              <span className="text-muted-foreground">75-100% available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-600" />
              <span className="text-muted-foreground">25-74% available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-600" />
              <span className="text-muted-foreground">0-24% available</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
