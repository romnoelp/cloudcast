"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { User } from "../inbox-type";

type CreateGroupChatDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectMembers: User[];
  projectId: string;
};

const CreateGroupChatDialog = ({ open, onOpenChange, projectMembers, projectId }: CreateGroupChatDialogProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroupChat = async () => {
    if (selectedUsers.length < 2 || !groupName.trim()) {
      toast.error("Group must have a name and at least 2 members.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("group_chats").insert([
      { name: groupName, project_id: projectId, members: JSON.stringify(selectedUsers) },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error creating group chat:", error);
      toast.error("Failed to create group chat. Try again.");
      return;
    }

    toast.success("Group chat created successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">Create a Group Chat</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Group Chat</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
        />

        <ScrollArea className="max-h-40 mt-3 border rounded-md p-2">
          {projectMembers.length > 0 ? (
            projectMembers.map((user) => (
              <Label
                key={user.id}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-muted transition"
              >
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleUserSelection(user.id)}
                />
                <Image
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
              </Label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No users available.</p>
          )}
        </ScrollArea>

        <Button onClick={handleCreateGroupChat} disabled={loading} className="w-full mt-4">
          {loading ? "Creating..." : "Create Group Chat"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupChatDialog;
