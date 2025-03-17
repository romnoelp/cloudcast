"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/context/organization-context";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";

// ✅ Import Server Action
import { createProject } from "@/app/dashboard/projects/actions";

interface ProjectCreateDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  fetchProjectsData: () => void;
}

const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  fetchProjectsData,
}) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const { selectedOrg } = useOrganization();
  const { user } = useUser();

  // ✅ Use Server Action instead of API
  const handleCreateProject = async () => {
    if (!selectedOrg) return;
    if (!user || !user.id) return;
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription,
        organization_id: selectedOrg.id,
        created_by: user.id,
      });

      fetchProjectsData(); // Refresh project list
      setIsDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      toast.success("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project.");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateDialog;
