"use client";

import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMessage } from "./actions";
import { useUser } from "@/context/user-context";

type ChatInputProps = {
  conversationId: string;
};

const ChatInput = ({ conversationId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { user } = useUser();

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!user) return console.error("❌ No user found");

    const newMessage = await sendMessage(conversationId, user.id, message);
    if (newMessage) {
      setMessage("");
      setFile(null);
    }
  };

  return (
    <div className="flex w-full items-center gap-2 px-4 py-3">
      <Input
        className="flex-grow h-12 border border-border focus:border-primary focus:ring-0"
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
