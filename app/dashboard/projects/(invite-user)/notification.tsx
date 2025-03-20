"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  createClient,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/lib/supabase/client";
import { Notification } from "./notification-type";
import NotificationDialog from "./notification-dialog";

export default function NotificationDropdown({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, user_id, type, message, is_read, created_at, sender_id, project_id, data"
        ) 
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setNotifications(data);
    };

    fetchNotifications();

    subscribeToNotifications(userId, (payload) => {
      if (!payload.new) return;

      const newNotification: Notification = {
        id: payload.new.id as string,
        user_id: payload.new.user_id as string,
        type: payload.new.type as "project_invite" | "task_assignment", 
        message: payload.new.message as string,
        is_read: payload.new.is_read as boolean,
        created_at: payload.new.created_at as string,
        sender_id: payload.new.sender_id as string | undefined,
        project_id: payload.new.project_id as string | undefined,
        data: payload.new.data as Record<string, unknown> | undefined,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      toast.info("New notification received!");
    });

    return () => {
      unsubscribeFromNotifications();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 text-xs px-1 py-0.5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => {
                setSelectedNotif(notification);
                markAsRead(notification.id);
              }}
              className={notification.is_read ? "opacity-50" : ""}
            >
              {notification.message}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
      </DropdownMenuContent>

      {selectedNotif && (
        <NotificationDialog
          notif={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </DropdownMenu>
  );
}

export const acceptProjectInvite = async (
  userId: string,
  projectId: string
) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("project_members")
    .update({ status: "active" }) 
    .match({ user_id: userId, project_id: projectId });

  if (error) throw new Error("Failed to accept project invitation");

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .match({ user_id: userId, "data->>project_id": projectId });

  return { success: true };
};

export const declineProjectInvite = async (
  userId: string,
  projectId: string
) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("project_members")
    .delete()
    .match({ user_id: userId, project_id: projectId });

  if (error) throw new Error("Failed to decline project invitation");

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .match({ user_id: userId, "data->>project_id": projectId });

  return { success: true };
};
