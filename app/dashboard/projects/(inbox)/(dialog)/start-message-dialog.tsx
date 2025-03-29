"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserSearch from "../user-search";
import { User } from "../inbox-type";

type StartDirectMessageDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectMembers: User[];
  setSelectedMessage: (messageId: string) => void;
  projectId: string;
};

const StartDirectMessageDialog = ({
  open,
  onOpenChange,
  projectMembers,
  setSelectedMessage,
  projectId,
}: StartDirectMessageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Start a Direct Message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Direct Message</DialogTitle>
        </DialogHeader>
        <UserSearch
          users={projectMembers}
          setSelectedMessage={setSelectedMessage}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StartDirectMessageDialog;
