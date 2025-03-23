import { useState, useEffect } from "react";
import { Task } from "./task-type";
import { useUser } from "@/context/user-context"; // ✅ Import user context
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const EditTaskDialog = ({ editTask, setEditTask, handleUpdateTask }: {
  editTask: Task | null;
  setEditTask: (task: Task | null) => void;
  handleUpdateTask: (updatedTask: Task) => void;
}) => {
  const [taskData, setTaskData] = useState<Task | null>(null);
  const { user } = useUser(); // ✅ Get user role
  const isEmployee = user?.role === "employee"; // ✅ Check if user is an employee

  useEffect(() => {
    setTaskData(editTask);
  }, [editTask]);

  const handleChange = (field: keyof Task, value: string) => {
    setTaskData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const saveChanges = async () => {
    if (!taskData || !taskData.id) {
      console.error("Task ID is missing. Cannot update.");
      return;
    }

    await handleUpdateTask(taskData);
  };

  return (
    <AlertDialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
      <AlertDialogContent className="w-full max-w-lg p-6 bg-background rounded-lg shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">Edit Task</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {isEmployee 
              ? "As an employee, you can only update the task status."
              : "Modify the task details below."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 mt-3">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              value={taskData?.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="h-10 text-sm"
              disabled={isEmployee} // ✅ Disable for employees
            />
          </div>

          {/* Description */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of the task..."
              value={taskData?.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="text-sm h-28 resize-none"
              disabled={isEmployee} // ✅ Disable for employees
            />
          </div>

          {/* Label, Status, Priority */}
          <div className="grid grid-cols-3 gap-4">
            {/* Label */}
            <div className="space-y-1">
              <Label htmlFor="label" className="text-sm font-medium">Label</Label>
              <Select
                value={taskData?.label}
                onValueChange={(value) => handleChange("label", value)}
                disabled={isEmployee} // ✅ Disable for employees
              >
                <SelectTrigger id="label" className="h-10 w-full text-sm">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status - ✅ Employees CAN edit */}
            <div className="space-y-1">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={taskData?.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status" className="h-10 w-full text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">To Do</SelectItem> 
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
              <Select
                value={taskData?.priority}
                onValueChange={(value) => handleChange("priority", value)}
                disabled={isEmployee} // ✅ Disable for employees
              >
                <SelectTrigger id="priority" className="h-10 w-full text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="mt-5 flex justify-end space-x-3">
          <AlertDialogCancel className="h-10 px-4 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 px-6 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={saveChanges}
            disabled={isEmployee && editTask?.status === taskData?.status} // ✅ Prevent unnecessary updates
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditTaskDialog;
