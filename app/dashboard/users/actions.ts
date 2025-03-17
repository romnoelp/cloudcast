"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "./user_type";

const checkAdminAccess = async (orgId: string) => {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user?.id) throw new Error("Unauthorized: No user logged in");

  const { data: orgMember, error: orgError } = await supabase
    .from("organization_members")
    .select("role")
    .match({ user_id: authUser.user.id, organization_id: orgId })
    .single();

  if (orgError || !orgMember || orgMember.role !== "admin") {
    throw new Error("Unauthorized: You are not an admin of this organization");
  }

  return supabase;
};

export const fetchUsers = async (orgId: string): Promise<User[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_organization_members", { org_id: orgId });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data as User[]; 
};

export const acceptUser = async (userId: User["user_id"], orgId: string) => {
  const supabase = await checkAdminAccess(orgId);

  const { error } = await supabase
    .from("organization_members")
    .update({ status: "active" })
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to accept user");
};

export const rejectUser = async (userId: User["user_id"], orgId: string) => {
  const supabase = await checkAdminAccess(orgId);

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to reject user");
};

export const removeUser = async (userId: User["user_id"], orgId: string) => {
  const supabase = await checkAdminAccess(orgId);

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .match({ user_id: userId, organization_id: orgId });

  if (error) throw new Error("Failed to remove user");
};
