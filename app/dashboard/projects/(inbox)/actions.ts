"use server";


import { createClient } from "@/lib/supabase/server";
import { Conversation, SupabaseConversationRow } from "./inbox-type";

export const fetchProjectMembers = async (projectId: string) => {
  const supabase = await createClient();

  if (!projectId) {
    console.error("❌ Project ID is required");
    return [];
  }

  const { data, error } = await supabase
    .from("project_members")
    .select("user_id, users!inner(id, name, email, role, avatar_url)")
    .eq("project_id", projectId);

  if (error) {
    console.error("❌ Error fetching project members:", error);
    return [];
  }


  return data.map(({ users, user_id }) => {
    const user = Array.isArray(users) ? users[0] : users; 
    return {
      id: user?.id || user_id,
      name: user?.name || "Unknown",
      email: user?.email || "No email",
      role: user?.role || "employee",
      avatar_url: user?.avatar_url || "/default-avatar.png",
    };
  });
};


export const startConversation = async (
  userId: string,
  recipientId: string,
  projectId: string
): Promise<string | null> => {
  const supabase = await createClient();

  if (!userId || !recipientId || !projectId) {
    console.error("❌ User ID, Recipient ID, and Project ID are required");
    return null;
  }

  type ConversationRecord = {
    conversation_id: string;
    conversations: {
      id: string;
      type: "dm" | "group";
      project_id: string;
    };
  };

  const { data: existingConversations, error: fetchError } = await supabase
    .from("conversation_members")
    .select("conversation_id, conversations!inner(id, type, project_id)")
    .eq("user_id", userId) as unknown as { data: ConversationRecord[] | null; error: { message: string } | null };

  if (fetchError) {
    console.error("❌ Error checking existing conversations:", fetchError);
    return null;
  }

  for (const convo of existingConversations ?? []) {
    if (convo.conversations?.type === "dm" && convo.conversations?.project_id === projectId) {
      const { data: recipientExists } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", convo.conversation_id)
        .eq("user_id", recipientId)
        .maybeSingle(); 

      if (recipientExists) {
        console.log("✅ Existing conversation found:", convo.conversation_id);
        return convo.conversation_id;
      }
    }
  }

  const { data: newConversation, error: createError } = await supabase
    .from("conversations")
    .insert([{ type: "dm", project_id: projectId, created_by: userId }])
    .select("id")
    .single();

  if (createError) {
    console.error("❌ Error creating conversation:", createError);
    return null;
  }

  const { error: membersError } = await supabase
    .from("conversation_members")
    .insert([
      { conversation_id: newConversation.id, user_id: userId },
      { conversation_id: newConversation.id, user_id: recipientId },
    ]);

  if (membersError) {
    console.error("❌ Error adding members to conversation:", membersError);
    return null;
  }

  console.log("✅ New conversation started:", newConversation.id);
  return newConversation.id;
};

export const fetchMessages = async (conversationId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at, conversation_id, sender:users(id, name, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((message) => ({
    ...message,
    sender: Array.isArray(message.sender) ? message.sender[0] : message.sender, 
  }));
};




export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  const supabase = await createClient();

  if (!content.trim()) {
    console.error("❌ Message content is empty.");
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, sender_id: senderId, content }])
    .select()
    .single();

  if (error) {
    console.error("❌ Error sending message:", error);
    return null;
  }

  console.log("✅ Message sent:", data);
  return data;
};

export async function createGroupChat(name: string, memberIds: string[], createdBy: string, projectId: string) {
  const supabase = await createClient();

  const uniqueMemberIds = Array.from(new Set(memberIds));

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert([{ name, type: "group", project_id: projectId, created_by: createdBy }])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating group conversation:", error);
    return null;
  }

  const members = uniqueMemberIds.map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));

  const { error: membersError } = await supabase.from("conversation_members").insert(members);
  if (membersError) {
    console.error("❌ Error adding members to group chat:", membersError);
    return null;
  }

  console.log("✅ Group chat created:", conversation.id);
  return conversation;
}


export const fetchConversations = async (userId: string) => {
  const supabase = await createClient();

  if (!userId) {
    console.error("❌ User ID is required.");
    return [];
  }

  const { data: conversationIds, error: conversationIdsError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  if (conversationIdsError) {
    console.error("❌ Error fetching conversation IDs:", conversationIdsError);
    return [];
  }

  const conversationIdList = conversationIds?.map((c) => c.conversation_id) || [];

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      type,
      name,
      conversation_members(users(id, name, avatar_url)),
      messages(content, sender_id, created_at, sender:users(id, name, avatar_url))
    `)
    .in("id", conversationIdList);

  if (error) {
    console.error("❌ Error fetching conversations:", error);
    return [];
  }

  console.log("📥 Raw Conversations:", data);

  const conversationMap = new Map<string, Conversation>();

  (data as SupabaseConversationRow[])?.forEach((row) => {
    const users = row.conversation_members?.map((cm) => cm.users).filter(Boolean).flat() || [];
    const recipient = users.find((u) => u.id !== userId);

    const lastMessage = row.messages?.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    console.log("🔍 Last Message:", lastMessage);

    conversationMap.set(row.id, {
      id: row.id,
      type: row.type,
      name: row.name || (recipient?.name || "Unnamed Chat"),
      avatar: recipient?.avatar_url || "",
      lastMessageContent: lastMessage?.content || null,
      lastMessageSenderId: lastMessage?.sender_id || null,
      lastMessageSenderName: lastMessage?.sender?.[0]?.name || null, 
    });
  });

  const processedConversations = Array.from(conversationMap.values());
  console.log("✅ Processed Conversations:", processedConversations);

  return processedConversations;
};