"use client";

import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";

interface MessageActionsProps {
  onConference: () => void; 
}

const MessageActions = ({ onConference }: MessageActionsProps) => {
  return (
    <div className="flex justify-end gap-2 border-b px-4 py-2">
      <Button
        size="sm"
        className="bg-[var(--color-primary)]"
        onClick={onConference}  
      >
        <VideoIcon className="w-4 h-4 mr-2" />
        Create Conference
      </Button>
    </div>
  );
};

export default MessageActions;
