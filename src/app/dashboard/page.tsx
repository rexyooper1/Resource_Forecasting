import { getProjects, getLCATs, getEmployees } from "@/lib/data";
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

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Demand Dashboard"
        description="Labor demand forecast for preliminary projects"
      />
      <div className="flex-1 p-6 space-y-6">
        <DemandSummary projects={projects} employees={employees} lcats={lcats} />
        <CapacitySummary projects={projects} employees={employees} lcats={lcats} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DemandChart projects={projects} lcats={lcats} employees={employees} />
          <TimelineChart projects={projects} lcats={lcats} employees={employees} />
        </div>
        <StaffingGapTable projects={projects} employees={employees} lcats={lcats} />
        <ProjectPipeline projects={projects} />
      </div>
    </div>
  );
}
