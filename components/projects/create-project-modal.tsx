"use client";

import { useState } from "react";
import { CreateProjectModalProps } from "@/types/create-modal-props"; 
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onOpenChange,
  onCreate,
}) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const handleCreate = () => {
    onCreate(newProjectName, newProjectDescription);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => {
            setNewProjectName(e.target.value);
            console.log("New Project Name:", e.target.value);
          }}
        />
        <textarea
          placeholder="Project Description"
          value={newProjectDescription}
          onChange={(e) => {
            setNewProjectDescription(e.target.value);
            console.log("New Project Description:", e.target.value);
          }}
        />
        <DialogFooter>
          <Button onClick={handleCreate}>Create</Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
