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
    .select("user_id, users!inner(id, name, avatar_url)")
    .eq("project_id", projectId);

  if (error) {
    console.error("❌ Error fetching project members:", error);
    return [];
  }

  console.log("✅ Project Members (raw response):", data);

  return data.map(({ users, user_id }) => {
    const user = Array.isArray(users) ? users[0] : users; 
    return {
      id: user?.id || user_id,
      name: user?.name || "Unknown",
      avatar: user?.avatar_url || "",
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