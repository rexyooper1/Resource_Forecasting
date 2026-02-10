"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getProjects, saveProjects, getAssignments, saveAssignments } from "@/lib/data";
import { Project, ProjectStatus } from "@/types";

export interface ProjectFormData {
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  winProbability: number;
  startDate: string;
  endDate: string;
  lcatRequirements: {
    lcatId: string;
    fteCount: number;
    requiredSkills: string[];
  }[];
}

export async function createProject(data: ProjectFormData) {
  const projects = getProjects();
  const now = new Date().toISOString();
  const newProject: Project = {
    id: uuidv4(),
    name: data.name,
    client: data.client,
    description: data.description,
    status: data.status,
    winProbability: data.winProbability,
    periodOfPerformance: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
    lcatRequirements: data.lcatRequirements.map((req) => ({
      id: uuidv4(),
      lcatId: req.lcatId,
      fteCount: req.fteCount,
      requiredSkills: req.requiredSkills,
    })),
    createdAt: now,
    updatedAt: now,
  };
  projects.push(newProject);
  saveProjects(projects);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return newProject;
}

export async function updateProject(id: string, data: ProjectFormData) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Project not found");

  const existingProject = projects[index];

  // Build a map from lcatId to existing requirement ID to preserve IDs
  const existingReqMap = new Map<string, string>();
  existingProject.lcatRequirements.forEach((req) => {
    existingReqMap.set(req.lcatId, req.id);
  });

  const newRequirements = data.lcatRequirements.map((req) => ({
    id: existingReqMap.get(req.lcatId) ?? uuidv4(),
    lcatId: req.lcatId,
    fteCount: req.fteCount,
    requiredSkills: req.requiredSkills,
  }));

  // Find removed requirement IDs and delete their assignments
  const newReqIds = new Set(newRequirements.map((r) => r.id));
  const removedReqIds = existingProject.lcatRequirements
    .filter((r) => !newReqIds.has(r.id))
    .map((r) => r.id);

  if (removedReqIds.length > 0) {
    const assignments = getAssignments();
    const filteredAssignments = assignments.filter(
      (a) => !removedReqIds.includes(a.lcatRequirementId)
    );
    saveAssignments(filteredAssignments);
  }

  projects[index] = {
    ...existingProject,
    name: data.name,
    client: data.client,
    description: data.description,
    status: data.status,
    winProbability: data.winProbability,
    periodOfPerformance: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
    lcatRequirements: newRequirements,
    updatedAt: new Date().toISOString(),
  };
  saveProjects(projects);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/matching");
  revalidatePath(`/projects/${id}`);
  return projects[index];
}

export async function deleteProject(id: string) {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);

  const assignments = getAssignments();
  const filteredAssignments = assignments.filter((a) => a.projectId !== id);
  saveAssignments(filteredAssignments);

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/matching");
  revalidatePath("/employees");
}
