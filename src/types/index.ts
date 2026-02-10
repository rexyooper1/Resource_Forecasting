export type ProjectStatus = "preliminary" | "proposal_submitted" | "awarded" | "lost";
export type UserRole = "bd_manager" | "eng_manager" | "engineer";

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  winProbability: number;
  periodOfPerformance: {
    startDate: string;
    endDate: string;
  };
  lcatRequirements: LCATRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface LCATRequirement {
  id: string;
  lcatId: string;
  fteCount: number;
  requiredSkills: string[];
}

export interface LCAT {
  id: string;
  name: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface Employee {
  id: string;
  name: string;
  lcatId: string;
  skills: string[];
}

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  lcatRequirementId: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}
