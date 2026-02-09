"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createLCAT, updateLCAT, deleteLCAT } from "@/actions/settings";
import type { LCAT } from "@/types";

interface LCATManagerProps {
  initialLcats: LCAT[];
}

export function LCATManager({ initialLcats }: LCATManagerProps) {
  const [lcats, setLcats] = useState<LCAT[]>(initialLcats);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const created = await createLCAT({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setLcats((prev) => [...prev, created]);
      setNewName("");
      setNewDescription("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create LCAT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    try {
      const updated = await updateLCAT(id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setLcats((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update LCAT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteLCAT(id);
      setLcats((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error("Failed to delete LCAT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (lcat: LCAT) => {
    setEditingId(lcat.id);
    setEditName(lcat.name);
    setEditDescription(lcat.description || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewName("");
    setNewDescription("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Labor Categories</CardTitle>
            <CardDescription>
              Manage the labor categories (LCATs) available for project staffing.
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add LCAT
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="LCAT name"
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
                  <Textarea
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={1}
                    className="min-h-[40px] resize-none"
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

            {lcats.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No labor categories defined yet. Click &quot;Add LCAT&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              lcats.map((lcat) =>
                editingId === lcat.id ? (
                  <TableRow key={lcat.id}>
                    <TableCell>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(lcat.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={1}
                        className="min-h-[40px] resize-none"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(lcat.id)}
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
                  <TableRow key={lcat.id}>
                    <TableCell className="font-medium">{lcat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {lcat.description || "--"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(lcat)}
                          disabled={isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lcat.id)}
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
