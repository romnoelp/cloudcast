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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useOrganization } from "@/context/organization-context";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";
import { createTask } from "@/app/dashboard/projects/actions";
import { TaskCreateDialogProps } from "./task-type";

const TASK_LABELS = ["Feature", "Bug", "Improvement"] as const;
const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;

const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  fetchTasksData,
  users,
  projectId,
}) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLabel, setTaskLabel] = useState<"Feature" | "Bug" | "Improvement">(
    "Feature"
  );
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">(
    "Medium"
  );
  const [assignee, setAssignee] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { selectedOrg } = useOrganization();
  const { user } = useUser();
  const hasUnsavedChanges = taskTitle || taskDescription || assignee;
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!selectedOrg || !user || !assignee || !projectId) {
      return toast.error("All fields are required!");
    }

    setLoading(true);

    setLoading(true);

    try {
      await createTask({
        title: taskTitle,
        description: taskDescription,
        label: taskLabel,
        priority: taskPriority,
        status: "Todo",
        assignee_id: assignee,
        organization_id: selectedOrg.id,
        project_id: projectId,
        created_by: user.id,
      });

      await fetchTasksData();
      handleCloseDialog();
      toast.success("Task created successfully!");
    } catch (error) {
      console.error("❌ Error creating task:", error);
      toast.error("Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskLabel("Feature");
    setTaskPriority("Medium");
    setAssignee("");
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsDialogOpen(true);
          } else if (hasUnsavedChanges) {
            setShowConfirmDialog(true);
          } else {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* ✅ New Task Description Field */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter task details..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Select
                value={taskLabel}
                onValueChange={(value) =>
                  setTaskLabel(value as (typeof TASK_LABELS)[number])
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_LABELS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={taskPriority}
                onValueChange={(value) =>
                  setTaskPriority(value as (typeof TASK_PRIORITIES)[number])
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={
                loading ||
                !taskTitle.trim() ||
                !taskDescription.trim() ||
                !assignee
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ AlertDialog for Unsaved Changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close the task
              creation dialog?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleCloseDialog();
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCreateDialog;
