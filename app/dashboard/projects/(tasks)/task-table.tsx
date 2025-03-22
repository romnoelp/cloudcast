"use client";

import { useState, useMemo } from "react";
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
  Clock,
  Circle,
  Ban,
  HelpCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  PlusCircle,
  UserPlus,
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
  tasks,
  users,
  fetchTasksData,
}: {
  projectId: string;
  orgId: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; 
  users: TaskCreateDialogProps["users"];
  fetchTasksData: () => void;
}) => {

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { user } = useUser();

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
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Delete</DropdownMenuItem>
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
    </div>
  );
};

export default TasksTable;