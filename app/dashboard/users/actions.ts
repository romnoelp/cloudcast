"use server";

import { createClient } from "@/lib/supabase/server";

export const fetchUsers = async (orgId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_organization_members", { org_id: orgId });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data || [];
};

export const acceptUser = async (userId: string, orgId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ status: "active" })
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to accept user");
};

export const rejectUser = async (userId: string, orgId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to reject user");
};

export const removeUser = async (userId: string, orgId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to remove user");
};
