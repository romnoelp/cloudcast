"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Timer,
  CircleHelp,
  CircleOff,
  CircleCheck,
  Circle,
  ClockAlert,
  ClockArrowUp,
  ClockArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task, TaskCreateDialogProps } from "./task-type";
import { useUser } from "@/context/user-context";
import {
  subscribeToTasks,
  unsubscribeFromTasks,
  RealtimeTaskPayload,
} from "@/lib/supabase/client";
import { toast } from "sonner";
import { deleteTask, updateTask } from "./actions";
import { inviteUserToProject } from "../../users/actions";

import TaskFilter from "./task-filter";
import CreateTaskTooltip from "./create-task-tooltip";
import InviteUserTooltip from "./invite-user-tooltip";
import TaskCreateDialog from "./task-create-dialog";
import InviteDialog from "../(invite-user)/invite-dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EditTaskDialog from "./edit-task-dialog";
import DeleteTaskDialog from "./delete-task-dialog";
import TaskDrawer from "./task-drawer";
import TaskArea from "./task-area";

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
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowDoubleClick = (task: Task) => {
    setDrawerTask(task);
    setIsDrawerOpen(true);
  };
  const { user } = useUser();

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId, projectId);
      toast.success("Task deleted successfully.");
      fetchTasksData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    } finally {
      setDeleteTaskId(null);
    }
  }, [projectId, deleteTaskId, fetchTasksData]);

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!updatedTask?.id) {
      console.error("❌ Task ID is missing. Cannot update:", updatedTask);
      toast.error("Task ID is missing. Cannot update.");
      return;
    }

    try {
      console.log("🛠 Updating task in Supabase:", updatedTask);
      await updateTask(updatedTask.id, updatedTask);

      setTasksState((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );

      toast.success("Task updated successfully.");
      setEditTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
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

      fetchTasksData();
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
        cell: ({ row }) => {
          let icon;
          switch (row.original.status) {
            case "In Progress":
              icon = <Timer className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Backlog":
              icon = <CircleHelp className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Canceled":
              icon = <CircleOff className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Done":
              icon = <CircleCheck className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Todo":
              icon = <Circle className="w-4 h-4 mr-2 inline-block" />;
              break;
            default:
              icon = null;
          }
          return (
            <div className="flex items-center">
              {icon}
              {row.original.status}
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          let icon;
          switch (row.original.priority) {
            case "High":
              icon = <ClockAlert className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Medium":
              icon = <ClockArrowUp className="w-4 h-4 mr-2 inline-block" />;
              break;
            case "Low":
              icon = <ClockArrowDown className="w-4 h-4 mr-2 inline-block" />;
              break;
            default:
              icon = null;
          }
          return (
            <div className="flex items-center">
              {icon}
              {row.original.priority}
            </div>
          );
        },
      },
      {
        accessorKey: "assignee_id",
        header: "Assignee",
        cell: ({ row }) =>
          users.find((u) => u.id === row.original.assignee_id)?.name ||
          "Unknown",
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
            <DropdownMenuContent
              align="end"
              className="w-40 bg-background border border-border"
            >
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditTask(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteTaskId(row.original.id ?? null)}
                className="text-destructive-foreground"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 py-4">
        <div className="flex flex-1 space-x-2">
          <TaskFilter table={table} columns={columns} />
          {/* 🔥 Hide "Create Task" button for employees */}
          {user?.role !== "employee" && (
            <CreateTaskTooltip setIsDialogOpen={setIsDialogOpen} />
          )}
        </div>
  
        {/* 🔥 Hide "Invite Users" button for employees */}
        {user?.role !== "employee" && (
          <InviteUserTooltip setIsInviteDialogOpen={setIsInviteDialogOpen} />
        )}
      </div>
  
      {/* 🔥 Hide Task Creation Dialog for employees */}
      {user?.role !== "employee" && (
        <TaskCreateDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          projectId={projectId}
          users={users}
          fetchTasksData={fetchTasksData}
        />
      )}
  
      {/* 🔥 Hide Invite Users Dialog for employees */}
      {user?.role !== "employee" && (
        <InviteDialog
        isDialogOpen={isInviteDialogOpen}
        setIsDialogOpen={setIsInviteDialogOpen} // ✅ Change this to match InviteDialogProps
        users={users}
        projectId={projectId}
        orgId={orgId}
        inviteUserToProject={(data) =>
          inviteUserToProject({ ...data, senderId: user?.id || "" })
        }
      />
      )}
  
      <EditTaskDialog
        editTask={editTask}
        setEditTask={setEditTask}
        handleUpdateTask={handleUpdateTask}
      />
      <DeleteTaskDialog
        deleteTaskId={deleteTaskId}
        setDeleteTaskId={setDeleteTaskId}
        handleDeleteTask={handleDeleteTask}
      />
  
      <TaskArea
        table={table}
        columns={columns}
        onRowDoubleClick={handleRowDoubleClick}
      />
      <TaskDrawer
        task={drawerTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        users={users} 
      />
    </div>
  );
  
};

export default TasksTable;
