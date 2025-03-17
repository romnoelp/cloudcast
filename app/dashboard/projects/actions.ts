"use server";

import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/project";

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

export const fetchProjects = async (orgId: string): Promise<Project[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", orgId);

    if (error) {
        console.error("Error fetching projects:", error);
        return [];
    }

    return data as Project[];
};

export const fetchProjectDetails = async (projectId: string): Promise<Project | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    if (error) {
        console.error("Error fetching project details:", error);
        return null;
    }

    return data as Project;
};

export const createProject = async ({
    name,
    description,
    organization_id,
    created_by,
}: {
    name: string;
    description: string;
    organization_id: string;
    created_by: string;
}) => {
    const supabase = await createClient();

    if (!name || !organization_id || !created_by) {
        throw new Error("Missing required fields");
    }

    const { error } = await supabase
        .from("projects")
        .insert([{ name, description, organization_id, created_by }]);

    if (error) {
        throw new Error(error.message);
    }
};


export const updateProjectStatus = async (projectId: string, newStatus: string, orgId: string) => {
    const supabase = await checkAdminAccess(orgId); 

    const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId);

    if (error) throw new Error("Failed to update project status");
};

export const deleteProject = async (projectId: string, orgId: string) => {
    const supabase = await checkAdminAccess(orgId); 

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

    if (error) throw new Error("Failed to delete project");
};
