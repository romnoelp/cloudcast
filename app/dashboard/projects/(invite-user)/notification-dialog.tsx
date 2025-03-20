"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptProjectInvite, declineProjectInvite } from "./notification";
import { Notification } from "./notification-type";

export default function NotificationDialog({
  notif,
  onClose,
}: {
  notif: Notification;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptProjectInvite(
        notif.user_id,
        notif.data?.project_id as string
      );
      toast.success("You have joined the project!");
      onClose();
    } catch (error) {
      console.error("❌ Error accepting invite:", error);
      toast.error("Failed to accept invite.");
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await declineProjectInvite(
        notif.user_id,
        notif.data?.project_id as string
      );
      toast.success("You declined the invite.");
      onClose();
    } catch (error) {
      console.error("❌ Error declining invite:", error);
      toast.error("Failed to decline invite.");
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{notif.message}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {notif.sender_id ? `Invited by: ${notif.sender_id}` : ""}
          <br />
          {notif.data?.project_id ? `Project ID: ${notif.data.project_id}` : ""}
          <br />
          Sent at: {new Date(notif.created_at).toLocaleString()}
        </p>
        {notif.type === "project_invite" && ( 
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={handleDecline}
              disabled={loading}
            >
              Decline
            </Button>
            <Button onClick={handleAccept} disabled={loading}>
              Accept
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
