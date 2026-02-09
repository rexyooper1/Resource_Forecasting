"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, LCAT, Skill } from "@/types";
import type { ProjectFormData } from "@/actions/projects";
import { createProject, updateProject } from "@/actions/projects";
import {
  LCATRequirementForm,
  type RequirementFormData,
} from "@/components/projects/lcat-requirement-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ProjectFormProps {
  project?: Project;
  lcats: LCAT[];
  skills: Skill[];
}

export function ProjectForm({ project, lcats, skills }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  const [name, setName] = useState(project?.name ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "preliminary");
  const [winProbability, setWinProbability] = useState(
    project?.winProbability ?? 50
  );
  const [startDate, setStartDate] = useState(
    project?.periodOfPerformance.startDate ?? ""
  );
  const [endDate, setEndDate] = useState(
    project?.periodOfPerformance.endDate ?? ""
  );
  const [requirements, setRequirements] = useState<RequirementFormData[]>(
    project?.lcatRequirements.map((req) => ({
      lcatId: req.lcatId,
      fteCount: req.fteCount,
      requiredSkills: req.requiredSkills,
    })) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData: ProjectFormData = {
        name,
        client,
        description,
        status,
        winProbability,
        startDate,
        endDate,
        lcatRequirements: requirements,
      };

      if (isEditing && project) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData);
      }

      router.push("/projects");
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-3xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Project["status"])}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preliminary">Preliminary</SelectItem>
                <SelectItem value="proposal_submitted">
                  Proposal Submitted
                </SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="winProbability">
              Win Probability: {winProbability}%
            </Label>
            <Slider
              id="winProbability"
              min={0}
              max={100}
              step={1}
              value={[winProbability]}
              onValueChange={(value) => setWinProbability(value[0])}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <LCATRequirementForm
            lcats={lcats}
            skills={skills}
            requirements={requirements}
            onChange={setRequirements}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Project"
            : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
