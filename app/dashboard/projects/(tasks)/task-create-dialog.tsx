// "use client";

// import { useState } from "react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useOrganization } from "@/context/organization-context";
// import { useUser } from "@/context/user-context";
// import { toast } from "sonner";
// import { createTask } from "@/app/dashboard/tasks/actions"; // ✅ Replace with actual task creation function
// import { TaskCreateDialogProps } from "./task-type"; // ✅ Ensure this type exists
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
//     isDialogOpen,
//     setIsDialogOpen,
//     fetchTasksData, // ✅ Function to refresh tasks
// }) => {
//     const [taskTitle, setTaskTitle] = useState("");
//     const [taskLabel, setTaskLabel] = useState("Feature"); // Default to Feature
//     const [taskPriority, setTaskPriority] = useState("Medium"); // Default to Medium

//     const { selectedOrg } = useOrganization();
//     const { user } = useUser();

//     const handleCreateTask = async () => {
//         if (!selectedOrg) return toast.error("No organization selected!");
//         if (!user || !user.id) return toast.error("User not found!");

//         try {
//             await createTask({
//                 title: taskTitle,
//                 label: taskLabel,
//                 priority: taskPriority,
//                 organization_id: selectedOrg.id,
//                 created_by: user.id,
//             });

//             fetchTasksData(); // ✅ Refresh the tasks list
//             setIsDialogOpen(false);
//             setTaskTitle("");
//             setTaskLabel("Feature");
//             setTaskPriority("Medium");
//             toast.success("Task created successfully!");
//         } catch (error) {
//             console.error("Error creating task:", error);
//             toast.error("Failed to create task.");
//         }
//     };

//     return (
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>Create Task</DialogTitle>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     {/* Title Input */}
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="title" className="text-right">
//                             Title
//                         </Label>
//                         <Input
//                             id="title"
//                             value={taskTitle}
//                             onChange={(e) => setTaskTitle(e.target.value)}
//                             className="col-span-3"
//                         />
//                     </div>

//                     {/* Label Dropdown */}
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="label" className="text-right">
//                             Label
//                         </Label>
//                         <Select value={taskLabel} onValueChange={setTaskLabel}>
//                             <SelectTrigger className="col-span-3">
//                                 <SelectValue placeholder="Select label" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="Feature">Feature</SelectItem>
//                                 <SelectItem value="Bug">Bug</SelectItem>
//                                 <SelectItem value="Improvement">Improvement</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     {/* Priority Dropdown */}
//                     <div className="grid grid-cols-4 items-center gap-4">
//                         <Label htmlFor="priority" className="text-right">
//                             Priority
//                         </Label>
//                         <Select value={taskPriority} onValueChange={setTaskPriority}>
//                             <SelectTrigger className="col-span-3">
//                                 <SelectValue placeholder="Select priority" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="High">High</SelectItem>
//                                 <SelectItem value="Medium">Medium</SelectItem>
//                                 <SelectItem value="Low">Low</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </div>

//                 {/* Dialog Footer */}
//                 <DialogFooter>
//                     <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
//                         Cancel
//                     </Button>
//                     <Button onClick={handleCreateTask} disabled={!taskTitle.trim()}>
//                         Create Task
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default TaskCreateDialog;
