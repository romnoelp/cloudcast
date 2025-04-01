"use client";

import StartDirectMessageDialog from "./(dialog)/start-message-dialog";
import CreateGroupChatDialog from "./(dialog)/create-group-chat-dialog";
import { User } from "./inbox-type";
import { useState } from "react";

interface SidebarActionsProps {
  projectId: string;
  projectMembers: User[];
  setSelectedMessage: (conversationId: string | null) => void;
}

const SidebarActions = ({
  projectId,
  projectMembers,
  setSelectedMessage,
}: SidebarActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);

  return (
    <div className="flex justify-evenly gap-2"> 
      <StartDirectMessageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        setSelectedMessage={setSelectedMessage}
        projectId={projectId}
        projectMembers={projectMembers}
      />
      <CreateGroupChatDialog
        open={isGroupChatOpen}
        onOpenChange={setIsGroupChatOpen}
        projectId={projectId}
        projectMembers={projectMembers}
      />
    </div>
  );
};

export default SidebarActions;