"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LCAT } from "@/types";
import {
  ProjectDemand,
  LCATAggregateDemand,
} from "@/lib/unassigned-demand";

interface UnassignedDemandTabsProps {
  projectDemands: ProjectDemand[];
  lcatAggregates: LCATAggregateDemand[];
  activeLCATIds: string[];
  lcats: LCAT[];
}

const statusConfig = {
  preliminary: {
    label: "Preliminary",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  proposal_submitted: {
    label: "Proposal Submitted",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

export function UnassignedDemandTabs({
  projectDemands,
  lcatAggregates,
  activeLCATIds,
  lcats,
}: UnassignedDemandTabsProps) {
  const lcatMap = new Map(lcats.map((l) => [l.id, l.name]));
  const activeLCATs = activeLCATIds
    .map((id) => ({ id, name: lcatMap.get(id) ?? id }))
    .sort((a, b) => a.name.localeCompare(b.name));

  function getUnassignedForLCAT(pd: ProjectDemand, lcatId: string): number {
    return pd.requirements
      .filter((r) => r.lcatId === lcatId)
      .reduce((sum, r) => sum + r.unassignedFte, 0);
  }

  return (
    <Tabs defaultValue="by-project">
      <TabsList>
        <TabsTrigger value="by-project">By Project</TabsTrigger>
        <TabsTrigger value="by-lcat">By LCAT</TabsTrigger>
      </TabsList>

      <TabsContent value="by-project">
        <Card>
          <CardContent className="pt-6">
            {projectDemands.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No unassigned demand across pre-award projects.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    {activeLCATs.map((lcat) => (
                      <TableHead key={lcat.id} className="text-right">
                        {lcat.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectDemands.map((pd) => {
                    const config = statusConfig[pd.status];
                    return (
                      <TableRow key={pd.projectId}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/projects/${pd.projectId}`}
                            className="text-primary hover:underline"
                          >
                            {pd.projectName}
                          </Link>
                        </TableCell>
                        <TableCell>{pd.client}</TableCell>
                        <TableCell>
                          <Badge className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {pd.winProbability}%
                        </TableCell>
                        {activeLCATs.map((lcat) => {
                          const val = getUnassignedForLCAT(pd, lcat.id);
                          return (
                            <TableCell
                              key={lcat.id}
                              className="text-right font-medium"
                            >
                              {val > 0 ? val.toFixed(1) : "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-bold">
                          {pd.totalUnassignedFte.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="by-lcat">
        <Card>
          <CardContent className="pt-6">
            {lcatAggregates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No unassigned demand across pre-award projects.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Labor Category</TableHead>
                    <TableHead className="text-right">Projects</TableHead>
                    <TableHead className="text-right">
                      Total Unassigned FTE
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lcatAggregates.map((agg) => (
                    <TableRow key={agg.lcatId}>
                      <TableCell className="font-medium">
                        {agg.lcatName}
                      </TableCell>
                      <TableCell className="text-right">
                        {agg.projectCount}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {agg.totalUnassignedFte.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
