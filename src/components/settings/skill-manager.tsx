"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSkill, updateSkill, deleteSkill } from "@/actions/settings";
import type { Skill } from "@/types";

interface SkillManagerProps {
  initialSkills: Skill[];
}

export function SkillManager({ initialSkills }: SkillManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const created = await createSkill({
        name: newName.trim(),
        category: newCategory.trim() || undefined,
      });
      setSkills((prev) => [...prev, created]);
      setNewName("");
      setNewCategory("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    try {
      const updated = await updateSkill(id, {
        name: editName.trim(),
        category: editCategory.trim() || undefined,
      });
      setSkills((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewName("");
    setNewCategory("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Skills</CardTitle>
            <CardDescription>
              Manage the skills that can be assigned to employees and project requirements.
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Skill name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") cancelAdding();
                    }}
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Category (optional)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") cancelAdding();
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleAdd}
                      disabled={isLoading || !newName.trim()}
                      className="h-8 w-8 text-green-500 hover:text-green-400"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelAdding}
                      disabled={isLoading}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {skills.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No skills defined yet. Click &quot;Add Skill&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              skills.map((skill) =>
                editingId === skill.id ? (
                  <TableRow key={skill.id}>
                    <TableCell>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(skill.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(skill.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(skill.id)}
                          disabled={isLoading || !editName.trim()}
                          className="h-8 w-8 text-green-500 hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEditing}
                          disabled={isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>
                      {skill.category ? (
                        <Badge variant="secondary">{skill.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(skill)}
                          disabled={isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(skill.id)}
                          disabled={isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
