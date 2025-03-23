"use client";

import { useState, useEffect, useCallback } from "react";
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
import ProjectTableRow from "./project-table-row";
import ProjectCreateDialog from "./project-create-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ProjectDetails from "./project-details";
import {
  fetchProjects,
  updateProjectStatus,
  deleteProject,
  fetchProjectDetails,
} from "@/app/dashboard/projects/actions";
import { useUser } from "@/context/user-context";

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
  const { role } = useUser();

  const fetchProjectsData = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const fetchedProjects = await fetchProjects(selectedOrg.id);

      const filteredProjects =
        role === "admin"
          ? fetchedProjects
          : fetchedProjects.filter((project) => project.status !== "archived");

      setProjects(filteredProjects);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, role]);

  useEffect(() => {
    fetchProjectsData();
  }, [fetchProjectsData, role]);

  const handleOpenProject = async (projectId: string) => {
    const project = await fetchProjectDetails(projectId);
    if (!project) {
      toast.error("Project not found.");
      return;
    }
    setOpenedProjectId(project.id);
  };

  const handleDeleteProjectAction = async (projectId: string) => {
    if (!selectedOrg || role !== "admin") return;
    try {
      await deleteProject(projectId, selectedOrg.id);
      fetchProjectsData();
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
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
          className={`px-2 py-1 rounded-md text-xs ${
            row.original.status === "active"
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
          if (!selectedOrg || role !== "admin") return;
          try {
            const newStatus = isArchived ? "active" : "archived";
            await updateProjectStatus(
              row.original.id,
              newStatus,
              selectedOrg.id
            );
            fetchProjectsData();
            toast.success(
              `Project ${isArchived ? "activated" : "archived"} successfully!`
            );
          } catch (error) {
            console.error(
              `Error ${isArchived ? "activating" : "archiving"} project:`,
              error
            );
            toast.error(
              `Failed to ${isArchived ? "activate" : "archive"} project.`
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
              {role === "admin" && (
                <DropdownMenuItem onClick={handleStatusChange}>
                  {actionText}
                </DropdownMenuItem>
              )}
              {role === "admin" && (
                <DropdownMenuItem
                  onClick={() => handleDeleteProjectAction(row.original.id)}
                >
                  Delete
                </DropdownMenuItem>
              )}
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
    table.setColumnFilters([{ id: "name", value: filterValue }]);
  }, [filterValue, table]);

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
            {role === "admin" && (
              <Button className="mr-2" onClick={() => setIsDialogOpen(true)}>
                Create Project
              </Button>
            )}
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
                    <TableCell colSpan={columns.length} className="h-24">
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="text-muted-foreground">
                          Check if there&apos;s a selected organization.
                        </span>
                        <span className="text-sm font-medium">
                          {role === "admin"
                            ? "No created projects."
                            : "No active projects found."}
                        </span>
                      </div>
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
