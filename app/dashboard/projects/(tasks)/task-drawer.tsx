"use client";

import { 
  Drawer, DrawerContent, DrawerHeader, 
  DrawerTitle, DrawerDescription, DrawerFooter 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Card, CardTitle } from "@/components/ui/card";
import { Task } from "./task-type";

const TaskDrawer = ({
  task,
  isOpen,
  onClose,
  users,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: { id: string; name: string; avatar: string }[];
}) => {
  if (!task) return null;

  const assignee = users.find((user) => user.id === task.assignee_id);
  const avatarSrc = assignee?.avatar?.replace("=s96-c", "=s40-c") || "";

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-6">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-semibold">Task Details</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {task.description || "No description provided."}
            </DrawerDescription>
          </DrawerHeader>

          {assignee && (
            <div className="flex justify-center mt-6">
              <Card className="w-full max-w-md rounded-lg shadow-md border border-border flex flex-col items-center p-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage 
                    src={avatarSrc} 
                    alt={assignee.name} 
                    loading="lazy" 
                    className="transition-opacity duration-300 opacity-0"
                    onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                  />
                </Avatar>
                <div className="flex flex-col items-center mt-2">
                  <CardTitle className="text-sm font-medium">{assignee.name}</CardTitle>
                  <Label className="text-xs text-muted-foreground">Assignee</Label>
                </div>
              </Card>
            </div>
          )}

          <DrawerFooter className="mt-6">
            <Button 
              className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onClose}
            >
              Close
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDrawer;
