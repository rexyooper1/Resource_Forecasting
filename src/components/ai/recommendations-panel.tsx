"use client";

import { useState } from "react";
import Link from "next/link";
import { createAssignment } from "@/actions/assignments";
import type { Recommendation } from "@/app/api/ai/recommendations/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";

const priorityColors: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/15 text-green-400 border-green-500/30",
};

export function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRan(true);
    try {
      const res = await fetch("/api/ai/recommendations", { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecommendations(data);
    } catch {
      setError("Failed to load recommendations. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (rec: Recommendation) => {
    setAssigning(rec.lcatRequirementId);
    try {
      await createAssignment({
        employeeId: rec.recommendedEmployeeId,
        projectId: rec.projectId,
        lcatRequirementId: rec.lcatRequirementId,
      });
      await fetchRecommendations();
    } catch (err) {
      console.error("Assignment failed:", err);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Portfolio Recommendations</h2>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          {ran ? "Refresh" : "Analyze Portfolio"}
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loading && !ran && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Click <span className="text-foreground font-medium">Analyze Portfolio</span> to generate AI-powered staffing recommendations.
          </CardContent>
        </Card>
      )}

      {!loading && ran && !error && recommendations.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No unassigned requirements found. All active projects are fully staffed.
          </CardContent>
        </Card>
      )}

      {!loading && recommendations.map((rec) => (
        <Card key={`${rec.projectId}-${rec.lcatRequirementId}`} className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs capitalize border ${priorityColors[rec.priority] ?? priorityColors.medium}`}
                  >
                    {rec.priority}
                  </Badge>
                  <CardTitle className="text-base">{rec.projectName}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Need: 1× {rec.lcatName} &nbsp;·&nbsp; {rec.winProbability}% win probability
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Recommended: </span>
                <span className="font-medium text-foreground">{rec.employeeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Available: </span>
                <span className="font-medium text-primary">{rec.availabilityPct}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Skills: </span>
                <span className="font-medium text-foreground">
                  {rec.skillMatchCount}/{rec.totalSkillsRequired}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">{rec.rationale}</p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => handleAssign(rec)}
                disabled={assigning === rec.lcatRequirementId}
              >
                {assigning === rec.lcatRequirementId ? "Assigning..." : "Assign"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${rec.projectId}`}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
