"use server";


import { createClient } from "@/lib/supabase/server";

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
    sender: Array.isArray(message.sender) ? message.sender[0] : message.sender, // Ensure sender is a single object
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

