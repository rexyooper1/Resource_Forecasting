"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProjectDeleteButtonProps {
  projectId: string;
}

export function ProjectDeleteButton({ projectId }: ProjectDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete Project"}
    </Button>
  );
}
