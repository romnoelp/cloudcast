"use client";

import { flexRender, Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { Project } from "@/types/project";

interface ProjectTableRowProps {
  row: Row<Project>;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({ row }) => {
  return (
    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default ProjectTableRow;