"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Employee, LCAT, Skill } from "@/types";
import { createEmployee, updateEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFormProps {
  employee?: Employee;
  lcats: LCAT[];
  skills: Skill[];
}

export function EmployeeForm({ employee, lcats, skills }: EmployeeFormProps) {
  const router = useRouter();
  const isEditing = !!employee;

  const [name, setName] = useState(employee?.name ?? "");
  const [lcatId, setLcatId] = useState(employee?.lcatId ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    employee?.skills ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      const category = skill.category ?? "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {}
  );

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        name,
        lcatId,
        skills: selectedSkills,
      };

      if (isEditing && employee) {
        await updateEmployee(employee.id, formData);
      } else {
        await createEmployee(formData);
      }

      router.push("/employees");
    } catch (error) {
      console.error("Failed to save employee:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Employee" : "New Employee"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter employee name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Labor Category */}
          <div className="space-y-2">
            <Label htmlFor="lcat">Labor Category</Label>
            <Select value={lcatId} onValueChange={setLcatId} required>
              <SelectTrigger id="lcat">
                <SelectValue placeholder="Select a labor category" />
              </SelectTrigger>
              <SelectContent>
                {lcats.map((lcat) => (
                  <SelectItem key={lcat.id} value={lcat.id}>
                    {lcat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="space-y-4 rounded-md border border-input p-4">
              {Object.keys(skillsByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills available. Add skills in Settings first.
                </p>
              ) : (
                Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {categorySkills.map((skill) => (
                          <label
                            key={skill.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill.id)}
                              onChange={() => handleSkillToggle(skill.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">{skill.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Employee"
                : "Create Employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employees")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
