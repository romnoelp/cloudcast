"use client";

import { Button } from "@/components/ui/button";
import { PhoneIcon, VideoIcon } from "lucide-react";

interface MessageActionsProps {
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

const MessageActions = ({ onVoiceCall, onVideoCall }: MessageActionsProps) => {
  return (
    <div className="flex justify-end gap-2 border-b px-4 py-2">
      <Button
        size="sm"
        className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white"
        onClick={onVoiceCall}
      >
        <PhoneIcon className="w-4 h-4 mr-2" />
        Voice Call
      </Button>

      <Button
        size="sm"
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
        onClick={onVideoCall}
      >
        <VideoIcon className="w-4 h-4 mr-2" />
        Video Call
      </Button>
    </div>
  );
};

export default MessageActions;