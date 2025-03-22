"use client";

import { useState, useEffect } from "react";
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
import {
  fetchProjectDetails,
  fetchUserDetails,
} from "@/app/dashboard/projects/actions";
import { fetchUserRole } from "./actions";

export default function NotificationDialog({
  notif,
  onClose,
}: {
  notif: Notification;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (notif.sender_id) {
        const sender = await fetchUserDetails(notif.sender_id);
        setSenderName(sender?.name || "Unknown Sender");
      }

      const projectId = notif.data?.project_id;
      if (typeof projectId === "string" && projectId.trim() !== "") {
        const project = await fetchProjectDetails(projectId);
        setProjectName(project?.name || "Unknown Project");

        if (notif.user_id) {
          const role = await fetchUserRole(notif.user_id, projectId);
          setUserRole(role || "Employee");
        }
      }
    };

    fetchDetails();
  }, [notif]);

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
          {senderName && `Invited by: ${senderName}`}
          <br />
          {projectName && `Project: ${projectName}`}
          <br />
          {userRole && `Proposed Role: ${userRole}`}
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
              {loading ? "Declining..." : "Decline"}
            </Button>
            <Button onClick={handleAccept} disabled={loading}>
              {loading ? "Accepting..." : "Accept"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
