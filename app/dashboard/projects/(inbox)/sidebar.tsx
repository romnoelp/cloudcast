"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { Conversation, User } from "./inbox-type";
import { useUser } from "@/context/user-context";
import ConversationList from "./conversation-list";
import SidebarActions from "./sidebar-actions";

interface SidebarProps {
  setSelectedMessage: (conversationId: string | null) => void;
  isMinimized: boolean;
  selectedMessage: string | null;
  projectId: string;
  projectMembers: User[];
}

const Sidebar = ({
  setSelectedMessage,
  isMinimized,
  selectedMessage,
  projectId,
  projectMembers,
}: SidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useUser();
  const supabase = createClient();

  type RawConversation = {
    conversation_id: string;
    conversations: {
      id: string;
      type: "dm" | "group";
      name: string | null;
    };
    users: { id: string; name: string; avatar_url: string | null }[];
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

      const rawData = data as unknown;
      const conversationData = rawData as RawConversation[];

      conversationData.forEach((row) => {
        const conversationId = row.conversation_id;

        const conversation = row.conversations;

        const usersArray = Array.isArray(row.users) ? row.users : [row.users];
        const userInfo = usersArray.find((u) => u.id !== user.id);

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
    <div className="h-full w-full p-3 flex flex-col">
      <ScrollArea className="flex-grow">
        <ConversationList
          conversations={conversations}
          setSelectedMessage={setSelectedMessage}
          selectedMessage={selectedMessage}
          isMinimized={isMinimized}
        />
      </ScrollArea>
      {selectedMessage !== null && (
        <SidebarActions
          projectId={projectId}
          projectMembers={projectMembers}
          setSelectedMessage={setSelectedMessage}
        />
      )}
    </div>
  );
};

export default Sidebar;