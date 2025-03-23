"use server";

import { createClient } from "@/lib/supabase/server";

export const fetchUserRole = async (
  userId: string,
  projectId: string
): Promise<string | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_members")
    .select("role")
    .match({ user_id: userId, project_id: projectId })
    .single();

  if (error) {
    console.error("❌ Error fetching role:", error);
    return null;
  }

  console.log("✅ User Role:", data?.role);
  return data?.role || "Employee";
};
