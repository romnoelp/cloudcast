"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { MessageViewProps, User } from "./inbox-type";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import UserSearch from "./user-search";
import Image from "next/image";

const MessageView = ({
  selectedMessage,
  setSelectedMessage,
  projectId,
}: MessageViewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isDialogOpen && !isGroupChatOpen) return;

    const supabase = createClient();

    const fetchProjectMembers = async () => {
      console.log("Fetching project members...");
      const { data, error } = await supabase.rpc("get_project_members", {
        proj_id: projectId,
      });

      if (error) {
        console.error("Error fetching project members:", error);
        return;
      }

      console.log("Fetched Members:", data);
      setProjectMembers(data || []);
    };

    fetchProjectMembers();
  }, [isDialogOpen, isGroupChatOpen, projectId]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
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
      {
        name: groupName,
        project_id: projectId,
        members: JSON.stringify(selectedUsers),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error creating group chat:", error);
      toast.error("Failed to create group chat. Try again.");
      return;
    }

    toast.success("Group chat created successfully!");
    setIsGroupChatOpen(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {selectedMessage ? (
        <>
          <ScrollArea className="flex-grow w-full rounded-md overflow-auto"></ScrollArea>
          <div className="border-t bg-background p-2 w-full"></div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <p className="text-muted-foreground text-lg">
            Select a conversation to start messaging.
          </p>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

            <Dialog open={isGroupChatOpen} onOpenChange={setIsGroupChatOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Create a Group Chat</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a Group Chat</DialogTitle>
                </DialogHeader>

                <input
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
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.role}
                          </span>
                        </div>
                      </Label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No users available.
                    </p>
                  )}
                </ScrollArea>

                <Button
                  onClick={handleCreateGroupChat}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? "Creating..." : "Create Group Chat"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageView;
