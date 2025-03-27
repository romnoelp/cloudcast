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

  // ✅ Ensure conversations & users are arrays
  type RawConversation = {
    conversation_id: string;
    conversations: {
      id: string;
      type: "dm" | "group";
      name: string | null;
    }; // ✅ Change to an object (remove [])
    users: { id: string; name: string; avatar_url: string | null }[]; // ✅ Keep as an array
  };

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data: conversationIds, error: idError } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (idError) {
        console.error("❌ Error fetching conversation IDs:", idError);
        return;
      }

      const conversationIdList = conversationIds.map((c) => c.conversation_id);
      if (conversationIdList.length === 0) {
        console.warn("⚠️ No conversations found for this user.");
        setConversations([]);
        return;
      }

      const { data, error } = await supabase
        .from("conversation_members")
        .select(`
          conversation_id, 
          conversations!inner(id, type, name), 
          users!inner(id, name, avatar_url)
        `)
        .in("conversation_id", conversationIdList);

      if (error) {
        console.error("❌ Error fetching conversations:", error);
        return;
      }

      console.log("Fetched Conversations Data:", data);

      const conversationMap = new Map<
        string,
        {
          id: string;
          type: "dm" | "group";
          name: string;
          avatar: string;
          users: { id: string; name: string; avatar_url: string | null }[];
        }
      >();

      // ✅ Convert `data` to `unknown` first
      const rawData = data as unknown;
      const conversationData = rawData as RawConversation[];

      conversationData.forEach((row) => {
        const conversationId = row.conversation_id;

        // ✅ Extract the first element from arrays
        const conversation = row.conversations; // ✅ Directly access object

        const usersArray = Array.isArray(row.users) ? row.users : [row.users]; 
        const userInfo = usersArray.find((u) => u.id !== user.id); // ✅ Correct

        if (!conversation) {
          console.warn("⚠️ Skipping row due to missing conversation:", row);
          return;
        }

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversation.id,
            type: conversation.type,
            name: "Unnamed Chat",
            avatar: "",
            users: [],
          });
        }

        const conv = conversationMap.get(conversationId)!;
        if (userInfo && !conv.users.some((u) => u.id === userInfo.id)) {
          conv.users.push(userInfo);
        }
      });

      const processedConversations: Conversation[] = Array.from(
        conversationMap.values()
      ).map((conv) => {
        let displayName = conv.name;
        let avatarUrl = "";
      
        if (conv.type === "dm") {
          // ✅ Use `conv.users`, NOT `row.users`
          const usersArray = Array.isArray(conv.users) ? conv.users : [conv.users];
          const recipient = usersArray.find((u) => u.id !== user.id) || null;
      
          if (recipient) {
            displayName = recipient.name;
            avatarUrl = recipient.avatar_url || "";
          }
        }
      
        console.log(`👤 Processed Conversation - Name: ${displayName}, Avatar: ${avatarUrl}`);
      
        return {
          id: conv.id,
          type: conv.type,
          name: displayName,
          avatar: avatarUrl,
        };
      });
      
      

      console.log("✅ Final Processed Conversations:", processedConversations);
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
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
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
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
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
          <p className="text-muted-foreground text-center">No conversations found.</p>
        )}
      </div>
    </ScrollArea>
  );
};

export default Sidebar;
