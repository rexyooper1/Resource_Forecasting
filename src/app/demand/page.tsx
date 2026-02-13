import { Header } from "@/components/layout/header";
import { getProjects, getAssignments, getLCATs } from "@/lib/data";
import {
  calculateProjectUnassignedDemand,
  calculateLCATAggregateDemand,
  getActiveLCATIds,
} from "@/lib/unassigned-demand";
import { UnassignedDemandTabs } from "@/components/demand/unassigned-demand-tabs";

export const dynamic = "force-dynamic";

export default function DemandPage() {
  const projects = getProjects();
  const assignments = getAssignments();
  const lcats = getLCATs();

  const projectDemands = calculateProjectUnassignedDemand(projects, assignments);
  const lcatAggregates = calculateLCATAggregateDemand(projectDemands, lcats);
  const activeLCATIds = getActiveLCATIds(projectDemands);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Unassigned Demand"
        description="Unassigned FTE demand across pre-award projects by labor category"
      />
      <div className="flex-1 overflow-auto p-6">
        <UnassignedDemandTabs
          projectDemands={projectDemands}
          lcatAggregates={lcatAggregates}
          activeLCATIds={activeLCATIds}
          lcats={lcats}
        />
      </div>
    </div>
  );
}
