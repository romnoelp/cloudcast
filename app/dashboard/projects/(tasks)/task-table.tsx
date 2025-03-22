"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  CheckCircle,
  ChevronDown,
  Clock,
  Circle,
  Ban,
  HelpCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  PlusCircle,
  UserPlus,
  Tag,
  ListChecks,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Task, TaskCreateDialogProps } from "./task-type";
import TaskCreateDialog from "./task-create-dialog";
import InviteDialog from "../(invite-user)/invite-dialog";
import { inviteUserToProject } from "../../users/actions";
import { useUser } from "@/context/user-context";
import {
  subscribeToTasks,
  unsubscribeFromTasks,
  RealtimeTaskPayload,
} from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteTask, updateTask } from "./actions";

const statusIcons: Record<string, React.ReactNode> = {
  "In Progress": <Clock className="h-4 w-4" />,
  Done: <CheckCircle className="h-4 w-4" />,
  Todo: <Circle className="h-4 w-4" />,
  Backlog: <HelpCircle className="h-4 w-4" />,
  Canceled: <Ban className="h-4 w-4" />,
};

const priorityIcons: Record<string, React.ReactNode> = {
  High: <ArrowUp className="h-4 w-4" />,
  Medium: <ArrowRight className="h-4 w-4" />,
  Low: <ArrowDown className="h-4 w-4" />,
};

const TasksTable = ({
  projectId,
  orgId,
  tasks: initialTasks,
  users,
  fetchTasksData,
}: {
  projectId: string;
  orgId: string;
  tasks: Task[];
  users: TaskCreateDialogProps["users"];
  fetchTasksData: () => void;
}) => {
  const [tasks, setTasksState] = useState<Task[]>(initialTasks);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const { user } = useUser();

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskId) return;
    try {
      console.log("Deleting task:", deleteTaskId);
      await deleteTask(deleteTaskId, projectId);
      toast.success("Task deleted successfully.");
      fetchTasksData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete task.");
    } finally {
      setDeleteTaskId(null);
    }
  }, [projectId, deleteTaskId, fetchTasksData]);

  const handleUpdateTask = async () => {
    if (!editTask?.id) {
      console.error("Task ID is undefined.");
      toast.error("Error: Task ID is missing.");
      return;
    }

    try {
      console.log("Updating task:", editTask);
      await updateTask(editTask.id, editTask);
      toast.success("Task updated successfully.");
      fetchTasksData();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update task.");
    } finally {
      setEditTask(null);
    }
  };

  useEffect(() => {
    const handleTaskUpdate = (payload: RealtimeTaskPayload) => {
      setTasksState((prevTasks) => {
        switch (payload.eventType) {
          case "INSERT":
            return [...prevTasks, payload.new as Task];

          case "UPDATE":
            return prevTasks.map((task) =>
              task.id === (payload.new as Task).id
                ? (payload.new as Task)
                : task
            );

          case "DELETE":
            return prevTasks.filter((task) => task.id !== payload.old?.id);

          default:
            return prevTasks;
        }
      });

      fetchTasksData(); // 🔥 Ensures UI syncs with DB
    };

    subscribeToTasks(projectId, handleTaskUpdate);

    return () => {
      unsubscribeFromTasks();
    };
  }, [projectId, fetchTasksData]);

  useEffect(() => {
    setTasksState(initialTasks);
  }, [initialTasks]);

  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => (
          <Badge variant="outline" className="px-2 py-1 text-xs">
            {row.original.label}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {statusIcons[row.original.status]}
            {row.original.status}
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {priorityIcons[row.original.priority]}
            {row.original.priority}
          </div>
        ),
      },
      {
        accessorKey: "assignee_id",
        header: "Assignee",
        cell: ({ row }) => (
          <span>
            {users.find((u) => u.id === row.original.assignee_id)?.name ||
              "Unknown"}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (row.original?.id) {
                    setEditTask(row.original);
                  } else {
                    console.error("Task data is missing or undefined.");
                    toast.error("Error: Could not load task data.");
                  }
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (row.original.id) {
                    setDeleteTaskId(row.original.id);
                  } else {
                    console.error("Task ID is undefined.");
                    toast.error("Error: Could not get task ID");
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [users]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between py-4">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Task
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new task in this project</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Invite Users
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Invite organization members to this project
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Input
          placeholder="Filter tasks..."
          onChange={(event) => {
            const value = event.target.value.toLowerCase();
            table.setGlobalFilter(value);
          }}
          className="max-w-sm"
        />
      </div>
      <ScrollArea className="h-[550px] overflow-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No tasks found. Create one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <TaskCreateDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        projectId={projectId}
        users={users}
        fetchTasksData={fetchTasksData}
      />
      <InviteDialog
        isDialogOpen={isInviteDialogOpen}
        setIsDialogOpen={setIsInviteDialogOpen}
        users={users}
        projectId={projectId}
        orgId={orgId}
        inviteUserToProject={(data) =>
          inviteUserToProject({
            ...data,
            senderId: user?.id || "",
          })
        }
      />
      <AlertDialog
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Task</AlertDialogTitle>
            <AlertDialogDescription>
              Modify the task details and save changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Title & Description */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                value={editTask?.title || ""}
                onChange={(e) =>
                  setEditTask(
                    (prev) => prev && { ...prev, title: e.target.value }
                  )
                }
                placeholder="Task Title"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">
                Description
              </label>
              <Input
                value={editTask?.description || ""}
                onChange={(e) =>
                  setEditTask(
                    (prev) => prev && { ...prev, description: e.target.value }
                  )
                }
                placeholder="Task Description"
              />
            </div>

            {/* Label & Status (Side by Side) */}
            {/* Label, Status & Priority in One Line */}
<div className="flex gap-4">
  {/* Label */}
  <div className="flex flex-col flex-1">
    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
      <Tag className="h-4 w-4" /> Label
    </label>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-between">
          {editTask?.label || "Select Label"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {["Feature", "Bug", "Improvement"].map((label) => (
          <DropdownMenuItem
            key={label}
            onSelect={() =>
              setEditTask((prev) => prev && { ...prev, label: label as "Feature" | "Bug" | "Improvement" })
            }
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Status */}
  <div className="flex flex-col flex-1">
    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
      <ListChecks className="h-4 w-4" /> Status
    </label>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-between">
          {editTask?.status || "Select Status"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {["Todo", "In Progress", "Done", "Backlog", "Canceled"].map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() =>
              setEditTask((prev) => prev && { ...prev, status: status as "Todo" | "In Progress" | "Done" | "Backlog" | "Canceled" })
            }
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Priority */}
  <div className="flex flex-col flex-1">
    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
      <Flag className="h-4 w-4" /> Priority
    </label>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-between">
          {editTask?.priority || "Select Priority"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {["Low", "Medium", "High"].map((priority) => (
          <DropdownMenuItem
            key={priority}
            onSelect={() =>
              setEditTask((prev) => prev && { ...prev, priority: priority as "High" | "Medium" | "Low" })
            }
          >
            {priority}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>

          </div>

          {/* Buttons */}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditTask(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateTask}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTaskId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksTable;
