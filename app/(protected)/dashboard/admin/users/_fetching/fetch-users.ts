import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const fetchUsers = async (orgId: string) => {
  try {
    const { data, error } = await supabase.rpc("get_organization_members", {
      org_id: orgId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], error };
  }
};
