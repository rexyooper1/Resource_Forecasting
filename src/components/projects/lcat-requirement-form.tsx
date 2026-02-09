"use client";

import type { LCAT, Skill } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

export interface RequirementFormData {
  lcatId: string;
  fteCount: number;
  requiredSkills: string[];
}

interface LCATRequirementFormProps {
  lcats: LCAT[];
  skills: Skill[];
  requirements: RequirementFormData[];
  onChange: (reqs: RequirementFormData[]) => void;
}

export function LCATRequirementForm({
  lcats,
  skills,
  requirements,
  onChange,
}: LCATRequirementFormProps) {
  const addRequirement = () => {
    onChange([
      ...requirements,
      { lcatId: "", fteCount: 1, requiredSkills: [] },
    ]);
  };

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRequirement = (
    index: number,
    field: keyof RequirementFormData,
    value: string | number | string[]
  ) => {
    const updated = requirements.map((req, i) => {
      if (i !== index) return req;
      return { ...req, [field]: value };
    });
    onChange(updated);
  };

  const toggleSkill = (index: number, skillId: string) => {
    const req = requirements[index];
    const updatedSkills = req.requiredSkills.includes(skillId)
      ? req.requiredSkills.filter((s) => s !== skillId)
      : [...req.requiredSkills, skillId];
    updateRequirement(index, "requiredSkills", updatedSkills);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">LCAT Requirements</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
          <Plus className="mr-1 h-4 w-4" />
          Add Requirement
        </Button>
      </div>

      {requirements.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No LCAT requirements added yet. Click &quot;Add Requirement&quot; to
          add one.
        </p>
      )}

      {requirements.map((req, index) => (
        <div
          key={index}
          className="rounded-lg border border-border p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Requirement {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRequirement(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`lcat-${index}`}>LCAT</Label>
              <Select
                value={req.lcatId}
                onValueChange={(value) =>
                  updateRequirement(index, "lcatId", value)
                }
              >
                <SelectTrigger id={`lcat-${index}`}>
                  <SelectValue placeholder="Select LCAT" />
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

            <div className="space-y-2">
              <Label htmlFor={`fte-${index}`}>FTE Count</Label>
              <Input
                id={`fte-${index}`}
                type="number"
                min={0.1}
                step={0.1}
                value={req.fteCount}
                onChange={(e) =>
                  updateRequirement(
                    index,
                    "fteCount",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={req.requiredSkills.includes(skill.id)}
                    onChange={() => toggleSkill(index, skill.id)}
                    className="rounded border-input"
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
