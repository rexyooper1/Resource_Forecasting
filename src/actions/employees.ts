"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getEmployees, saveEmployees } from "@/lib/data";
import { Employee } from "@/types";

export interface EmployeeFormData {
  name: string;
  lcatId: string;
  skills: string[];
  availability: number;
}

export async function createEmployee(data: EmployeeFormData) {
  const employees = getEmployees();
  const newEmployee: Employee = {
    id: uuidv4(),
    name: data.name,
    lcatId: data.lcatId,
    skills: data.skills,
    availability: data.availability,
  };
  employees.push(newEmployee);
  saveEmployees(employees);
  revalidatePath("/employees");
  revalidatePath("/matching");
  return newEmployee;
}

export async function updateEmployee(id: string, data: EmployeeFormData) {
  const employees = getEmployees();
  const index = employees.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Employee not found");

  employees[index] = {
    ...employees[index],
    name: data.name,
    lcatId: data.lcatId,
    skills: data.skills,
    availability: data.availability,
  };
  saveEmployees(employees);
  revalidatePath("/employees");
  revalidatePath("/matching");
  return employees[index];
}

export async function deleteEmployee(id: string) {
  const employees = getEmployees();
  const filtered = employees.filter((e) => e.id !== id);
  saveEmployees(filtered);
  revalidatePath("/employees");
  revalidatePath("/matching");
}
