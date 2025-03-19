"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "./user_type";

const checkAdminAccess = async (orgId: string) => {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user?.id)
    throw new Error("Unauthorized: No user logged in");

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
  const { data, error } = await supabase.rpc("get_organization_members", {
    org_id: orgId,
  });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data as User[];
};

export const fetchUsersNotInProject = async (
  orgId: string,
  projectId: string
) => {
  console.log(
    "🔥 Fetching users not in project | orgId =",
    orgId,
    "| projectId =",
    projectId
  );

  if (!orgId || !projectId) {
    console.error("❌ Missing required parameters!");
    return [];
  }

  const supabase = await createClient();

  const { data: orgUsers } = await supabase
    .from("organization_members")
    .select("user_id, users!inner(id, name, email)")
    .eq("organization_id", orgId)
    .in("status", ["approved", "active"])
    .neq("role", "admin")
    .returns<
      {
        user_id: string;
        users: { id: string; name: string; email: string } | null;
      }[]
    >();

  if (!orgUsers) return [];

  console.log("✅ Active org users (excluding admins):", orgUsers);

  const { data: projectMembers } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId);

  if (!projectMembers) return [];

  console.log("✅ Project members:", projectMembers);

  const projectUserIds = new Set(projectMembers.map(({ user_id }) => user_id));

  const filteredUsers: { id: string; name: string; email: string }[] = orgUsers
    .filter(({ user_id }) => !projectUserIds.has(user_id))
    .map(({ users }) => {
      if (!users) return { id: "", name: "", email: "" };
      return {
        id: users.id,
        name: users.name,
        email: users.email,
      };
    });

  return filteredUsers;
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

// TODO : Fix this part

export const inviteUserToProject = async ({
  userId,
  projectId,
  role,
}: {
  userId: string;
  projectId: string;
  role: "employee" | "product-manager";
}) => {
  const supabase = await createClient();

  const { data: existingMember, error: checkError } = await supabase
    .from("project_members")
    .select("id")
    .match({ user_id: userId, project_id: projectId })
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error("Error checking user membership");
  }

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  const { error } = await supabase.from("project_members").insert([
    {
      user_id: userId,
      project_id: projectId,
      role: role,
    },
  ]);

  if (error) throw new Error("Failed to invite user to project");
};
