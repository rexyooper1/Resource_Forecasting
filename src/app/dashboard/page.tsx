import { getProjects, getLCATs, getEmployees, getAssignments } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { DemandSummary } from "@/components/dashboard/demand-summary";
import { CapacitySummary } from "@/components/dashboard/capacity-summary";
import { DemandChart } from "@/components/dashboard/demand-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { StaffingGapTable } from "@/components/dashboard/staffing-gap-table";
import { ProjectPipeline } from "@/components/dashboard/project-pipeline";

export default function DashboardPage() {
  const projects = getProjects();
  const lcats = getLCATs();
  const employees = getEmployees();
  const assignments = getAssignments();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Demand Dashboard"
        description="Labor demand forecast for preliminary projects"
      />
      <div className="flex-1 p-6 space-y-6">
        <DemandSummary projects={projects} employees={employees} lcats={lcats} assignments={assignments} />
        <CapacitySummary projects={projects} employees={employees} lcats={lcats} assignments={assignments} />
        <DemandChart projects={projects} lcats={lcats} employees={employees} assignments={assignments} />
        <TimelineChart projects={projects} lcats={lcats} employees={employees} assignments={assignments} />
        <StaffingGapTable projects={projects} employees={employees} lcats={lcats} assignments={assignments} />
        <ProjectPipeline projects={projects} />
      </div>
    </div>
  );
}
