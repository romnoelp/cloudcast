import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PlusCircle } from "lucide-react";

const CreateTaskTooltip = ({ setIsDialogOpen }: { setIsDialogOpen: (open: boolean) => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="default" onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Create Task
        </Button>
      </TooltipTrigger>
      <TooltipContent>Create a new task in this project</TooltipContent>
    </Tooltip>
  );
};

export default CreateTaskTooltip;