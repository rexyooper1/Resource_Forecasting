"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getLCATs, saveLCATs, getSkills, saveSkills } from "@/lib/data";
import { LCAT, Skill } from "@/types";

// LCAT Actions
export async function createLCAT(data: { name: string; description?: string }) {
  const lcats = getLCATs();
  const newLCAT: LCAT = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
  };
  lcats.push(newLCAT);
  saveLCATs(lcats);
  revalidatePath("/settings");
  return newLCAT;
}

export async function updateLCAT(id: string, data: { name: string; description?: string }) {
  const lcats = getLCATs();
  const index = lcats.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("LCAT not found");
  lcats[index] = { ...lcats[index], ...data };
  saveLCATs(lcats);
  revalidatePath("/settings");
  return lcats[index];
}

export async function deleteLCAT(id: string) {
  const lcats = getLCATs();
  const filtered = lcats.filter((l) => l.id !== id);
  saveLCATs(filtered);
  revalidatePath("/settings");
}

// Skill Actions
export async function createSkill(data: { name: string; category?: string }) {
  const skills = getSkills();
  const newSkill: Skill = {
    id: uuidv4(),
    name: data.name,
    category: data.category,
  };
  skills.push(newSkill);
  saveSkills(skills);
  revalidatePath("/settings");
  return newSkill;
}

export async function updateSkill(id: string, data: { name: string; category?: string }) {
  const skills = getSkills();
  const index = skills.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Skill not found");
  skills[index] = { ...skills[index], ...data };
  saveSkills(skills);
  revalidatePath("/settings");
  return skills[index];
}

export async function deleteSkill(id: string) {
  const skills = getSkills();
  const filtered = skills.filter((s) => s.id !== id);
  saveSkills(filtered);
  revalidatePath("/settings");
}
