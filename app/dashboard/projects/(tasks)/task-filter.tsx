import { Input } from "@/components/ui/input";
import { TaskFilterProps } from "./task-type";
import { Search } from "lucide-react";

const TaskFilter = ({ table }: TaskFilterProps) => {
  return (
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
        className="pl-10 py-2 w-full"
      />
    </div>
  );
};

export default TaskFilter;
