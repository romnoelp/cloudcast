"use client";

import { useState, useEffect, useContext } from "react";
import { useOrganization } from "@/context/organization-context";
import { Project } from "@/types/project";
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
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import ProjectTableRow from "./project-table-row";
import ProjectCreateDialog from "./project-create-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ProjectDetails from "@/components/projects/project-details";

const ProjectTable = () => {
  const { selectedOrg } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openedProjectId, setOpenedProjectId] = useState<string | null>(null);
  const { user } = useUser();

  const fetchProjectsData = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    const response = await fetch(
      `/api/projects?organizationId=${selectedOrg.id}`
    );
    if (!response.ok) {
      console.error("Error fetching projects:", response.statusText);
    } else {
      const data = await response.json();
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectsData();
  }, [selectedOrg, filterValue, sorting, columnFilters]);

  const handleOpenProject = (projectId: string) => {
    setOpenedProjectId(projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjectsData();
        toast.success("Project deleted successfully!");
      } else {
        console.error("Failed to delete project:", response.statusText);
        toast.error("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred while deleting project.");
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-md text-xs ${row.original.status === "active"
              ? "bg-green-500 text-white"
              : row.original.status === "archived"
                ? "bg-gray-300"
                : "bg-yellow-400"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const isArchived = row.original.status === "archived";
        const actionText = isArchived ? "Activate" : "Archive";
        const handleStatusChange = async () => {
          try {
            const newStatus = isArchived ? "active" : "archived";
            const response = await fetch(`/api/projects/${row.original.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
              fetchProjectsData();
              toast.success(
                `Project ${isArchived ? "activated" : "archived"} successfully!`
              );
            } else {
              console.error(
                `Failed to ${isArchived ? "activate" : "archive"} project:`,
                response.statusText
              );
              toast.error(
                `Failed to ${isArchived ? "activate" : "archive"} project.`
              );
            }
          } catch (error) {
            console.error(
              `Error ${isArchived ? "activating" : "archiving"} project:`,
              error
            );
            toast.error(
              `An error occurred while ${isArchived ? "activating" : "archiving"
              } project.`// components/projects/project-table.tsx (continued)

            );
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleOpenProject(row.original.id)}
              >
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStatusChange}>
                {actionText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProject(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: projects,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    table.setColumnFilters([
      {
        id: "name",
        value: filterValue,
      },
    ]);
  }, [filterValue]);

  return (
    <div className="w-full">
      {openedProjectId ? (
        <ProjectDetails
          projectId={openedProjectId}
          onClose={() => setOpenedProjectId(null)}
        />
      ) : (
        <>
          <div className="flex items-center py-4">
            <Button className="mr-2" onClick={() => setIsDialogOpen(true)}>
              Create Project
            </Button>
            <Input
              placeholder="Filter projects..."
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ProjectCreateDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            fetchProjectsData={fetchProjectsData}
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <ProjectTableRow key={row.id} row={row} />
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No created projects.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectTable;