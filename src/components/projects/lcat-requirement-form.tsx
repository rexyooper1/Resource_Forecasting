"use client";

import { useState } from "react";
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
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null);

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
            <div className="flex items-center justify-between">
              <Label>Required Skills</Label>
              {openPickerIndex !== index ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenPickerIndex(index)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Skill
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(skillId) => {
                      toggleSkill(index, skillId);
                      setOpenPickerIndex(null);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select skill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {skills
                        .filter((s) => !req.requiredSkills.includes(s.id))
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenPickerIndex(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {req.requiredSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground">No skills required.</p>
            ) : (
              <div className="rounded border border-border divide-y divide-border">
                {req.requiredSkills.map((skillId) => {
                  const skillName = skills.find((s) => s.id === skillId)?.name ?? skillId;
                  return (
                    <div key={skillId} className="flex items-center justify-between px-3 py-1.5 text-sm">
                      <span>{skillName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleSkill(index, skillId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
