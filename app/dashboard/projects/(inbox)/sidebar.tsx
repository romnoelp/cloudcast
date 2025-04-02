"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/user-context";
import { fetchConversations } from "./actions";
import ConversationList from "./conversation-list";
import SidebarActions from "./sidebar-actions";
import { Conversation, User } from "./inbox-type";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        const fetchedConversations = await fetchConversations(user.id);
        setConversations(fetchedConversations);
      } catch (error) {
        console.error("❌ Error fetching conversations:", error);
      }
    };

    loadConversations();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
      .channel("conversation_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          console.log("📩 New message added:", payload.new);
          try {
            const updatedConversations = await fetchConversations(user.id);
            setConversations(updatedConversations);
          } catch (error) {
            console.error("❌ Error fetching updated conversations:", error);
          }
        }
      )
      .subscribe();

    const conversationMembersSubscription = supabase
      .channel("conversation_members_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_members" },
        async (payload) => {
          console.log("👥 Conversation members changed:", payload);
          try {
            const updatedConversations = await fetchConversations(user.id);
            setConversations(updatedConversations);
          } catch (error) {
            console.error("❌ Error fetching updated conversations:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationMembersSubscription);
    };
  }, [user, supabase]);

  return (
    <div className="h-full w-full p-3 flex flex-col">
      <ScrollArea className="flex-grow" style={{ overflow: "visible" }}>
        <ConversationList
          conversations={conversations}
          setSelectedMessage={setSelectedMessage}
          selectedMessage={selectedMessage}
          isMinimized={isMinimized}
          userId={user?.id || ""}
        />
      </ScrollArea>
      <div
        className={`transition-opacity duration-300 ${
          isMinimized ? "opacity-0" : "opacity-100"
        }`}
      >
        {selectedMessage !== null && (
          <SidebarActions
            projectId={projectId}
            projectMembers={projectMembers}
            setSelectedMessage={setSelectedMessage}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;