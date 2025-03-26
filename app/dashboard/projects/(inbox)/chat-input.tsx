"use client";

import { useState } from "react";
import { Paperclip, ThumbsUp, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUploadDialog from "./file-upload-dialog"; 

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSendMessage = () => {
    if (!message.trim() && !file) return;

    console.log("Sending message:", message, file);

    setMessage("");
    setFile(null);
  };

  return (
    <div className="flex w-full items-center gap-2 px-4 py-3">
      <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
        <Paperclip className="w-5 h-5 text-muted-foreground" />
      </Button>

      <FileUploadDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFileSelect={setFile}
      />

      <Input
        className="flex-grow h-12 border border-border focus:border-primary focus:ring-0 focus-visible:ring-0"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />

      <Button variant="ghost" size="icon" onClick={handleSendMessage}>
        {message || file ? (
          <Send className="w-5 h-5 text-primary" />
        ) : (
          <ThumbsUp className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

export default ChatInput;
