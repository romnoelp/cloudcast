"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { SidebarProps, Conversation } from "./inbox-type";
import { useUser } from "@/context/user-context";

const Sidebar = ({ setSelectedMessage, isMinimized }: SidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversation_members")
        .select(
          `
          conversation_id, 
          conversations!inner(id, type, name), 
          users!inner(id, name, avatar_url) -- ✅ Fetch avatar_url
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("❌ Error fetching conversations:", error);
        return;
      }

      console.log("Fetched Conversations Data:", data);

      type RawConversation = {
        conversation_id: string;
        conversations: {
          id: string;
          type: "dm" | "group";
          name: string | null;
        };
        users: { id: string; name: string; avatar_url: string | null };
      };

      const processedConversations: Conversation[] = (
        data as unknown as RawConversation[]
      )
        .map((row) => {
          console.log("🔍 Processing row:", row);

          const conversation = row.conversations;
          if (!conversation) {
            console.warn("⚠️ Skipping row due to missing conversation:", row);
            return null;
          }

          let displayName = conversation.name?.trim() || "Unnamed Chat";
          let avatarUrl = row.users.avatar_url || "";

          if (conversation.type === "dm") {
            if (row.users.id !== user.id) {
              displayName = row.users.name;
              avatarUrl = row.users.avatar_url || "";
            } else {
              displayName = user.name;
              avatarUrl = user.avatar_url || "";
            }
          }

          console.log(
            `👤 Processed Conversation - Name: ${displayName}, Avatar: ${avatarUrl}`
          );

          return {
            id: conversation.id,
            type: conversation.type,
            name: displayName,
            avatar: avatarUrl,
          };
        })
        .filter((conv): conv is Conversation => conv !== null);

      console.log("Processed Conversations:", processedConversations);
      setConversations(processedConversations);
    };

    fetchConversations();
  }, [user, supabase]);

  return (
    <ScrollArea className="h-full w-full p-3">
      <div className="flex flex-col gap-2">
        {conversations.length > 0 ? (
          conversations.map((conversation) =>
            isMinimized ? (
              <Avatar
                key={conversation.id}
                className="w-12 h-12 cursor-pointer"
                onClick={() => setSelectedMessage(conversation.id)}
              >
                <AvatarImage
                  src={conversation.avatar}
                  alt={conversation.name}
                />

                <AvatarFallback>
                  {conversation.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Card
                key={conversation.id}
                className="cursor-pointer transition-all hover:bg-accent/30 p-3 rounded-lg"
                onClick={() => setSelectedMessage(conversation.id)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={conversation.avatar}
                      alt={conversation.name}
                    />
                    <AvatarFallback>
                      {conversation.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col flex-grow overflow-hidden">
                    <p className="text-sm font-semibold text-foreground">
                      {conversation.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )
        ) : (
          <p className="text-muted-foreground text-center">
            No conversations found.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default Sidebar;
