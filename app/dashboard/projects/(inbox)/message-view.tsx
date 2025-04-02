"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { MessageViewProps, Message, User } from "./inbox-type";
import ChatInput from "./chat-input";
import StartDirectMessageDialog from "./(dialog)/start-message-dialog";
import CreateGroupChatDialog from "./(dialog)/create-group-chat-dialog";
import { fetchMessages, fetchProjectMembers } from "./actions";
import Image from "next/image";
import { useUser } from "@/context/user-context";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MessageView = ({
  selectedMessage,
  setSelectedMessage,
  projectId,
}: MessageViewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadMembers = async () => {
      const members = await fetchProjectMembers(projectId);
      setProjectMembers(members);
    };
    loadMembers();
  }, [projectId]);

  useEffect(() => {
    if (!selectedMessage) return;

    const loadMessages = async () => {
      const data = await fetchMessages(selectedMessage);
      setMessages(data);
    };

    loadMessages();
  }, [selectedMessage]);

  useEffect(() => {
    if (!selectedMessage) {
      console.log("MessageView: selectedMessage is null or undefined.");
      return;
    }

    console.log(
      "MessageView: Subscribing to channel:",
      `conversation-${selectedMessage}`
    );

    const handleNewMessage = async (newMessage: Omit<Message, "sender">) => {
      console.log("MessageView: New message received:", newMessage);

      try {
        const { data: sender } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", newMessage.sender_id)
          .single();

        setMessages((prev) => {
          if (newMessage.conversation_id !== selectedMessage) return prev;
          return [
            ...prev,
            {
              ...newMessage,
              sender: sender
                ? {
                    id: sender.id,
                    name: sender.name,
                    avatar_url: sender.avatar_url || "/default-avatar.png",
                  }
                : undefined,
            },
          ];
        });
      } catch (error) {
        console.error("Error fetching sender:", error);
      }
    };

    const channel = supabase.channel(`conversation-${selectedMessage}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedMessage}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.new) {
            const newMessage = payload.new as Message;
            handleNewMessage({
              id: newMessage.id,
              sender_id: newMessage.sender_id,
              content: newMessage.content,
              created_at: newMessage.created_at,
              conversation_id: newMessage.conversation_id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMessage, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col w-full">
      {selectedMessage ? (
        <>
          <ScrollArea className="w-full h-[600px] max-h-[80vh] rounded-md border p-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 mb-4 ${
                    msg.sender_id === user?.id ? "justify-end" : ""
                  }`}
                >
                  {msg.sender_id !== user?.id && (
                    <Image
                      src={msg.sender?.avatar_url || "/default-avatar.png"}
                      alt={msg.sender?.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`px-4 py-2 rounded-lg max-w-xs cursor-pointer ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-white self-end"
                              : "bg-gray-200 text-black self-start"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {new Date(msg.created_at).toLocaleString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div ref={scrollRef}></div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No messages yet.
              </p>
            )}
          </ScrollArea>

          <div className="border-t bg-background p-2 w-full">
            <ChatInput conversationId={selectedMessage} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
          <p className="text-muted-foreground text-lg">
            Select a conversation to start messaging.
          </p>
          <div className="flex gap-2">
            <StartDirectMessageDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              setSelectedMessage={setSelectedMessage}
              projectId={projectId}
              projectMembers={projectMembers}
            />

            <CreateGroupChatDialog
              open={isGroupChatOpen}
              onOpenChange={setIsGroupChatOpen}
              projectId={projectId}
              projectMembers={projectMembers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageView;