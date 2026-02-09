import fs from "fs";
import path from "path";
import { Project, Employee, LCAT, Skill } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string): T[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Projects
export function getProjects(): Project[] { return readJsonFile<Project>("projects.json"); }
export function getProject(id: string): Project | undefined { return getProjects().find(p => p.id === id); }
export function saveProjects(projects: Project[]): void { writeJsonFile("projects.json", projects); }

// Employees
export function getEmployees(): Employee[] { return readJsonFile<Employee>("employees.json"); }
export function getEmployee(id: string): Employee | undefined { return getEmployees().find(e => e.id === id); }
export function saveEmployees(employees: Employee[]): void { writeJsonFile("employees.json", employees); }

// LCATs
export function getLCATs(): LCAT[] { return readJsonFile<LCAT>("lcats.json"); }
export function getLCAT(id: string): LCAT | undefined { return getLCATs().find(l => l.id === id); }
export function saveLCATs(lcats: LCAT[]): void { writeJsonFile("lcats.json", lcats); }

// Skills
export function getSkills(): Skill[] { return readJsonFile<Skill>("skills.json"); }
export function getSkill(id: string): Skill | undefined { return getSkills().find(s => s.id === id); }
export function saveSkills(skills: Skill[]): void { writeJsonFile("skills.json", skills); }
