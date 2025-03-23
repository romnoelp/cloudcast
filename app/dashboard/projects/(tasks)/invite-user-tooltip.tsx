import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";

const InviteUserTooltip = ({ setIsInviteDialogOpen }: { setIsInviteDialogOpen: (open: boolean) => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Invite Users
        </Button>
      </TooltipTrigger>
      <TooltipContent>Invite organization members to this project</TooltipContent>
    </Tooltip>
  );
};

export default InviteUserTooltip;
