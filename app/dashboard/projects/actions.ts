"use server";

import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/project";
import { Task } from "./(tasks)/task-type";

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

export const createTask = async (task: Task) => {
    const supabase = await createClient();

    if (!task.title || !task.project_id || !task.organization_id || !task.created_by || !task.assignee_id) {
        throw new Error("Missing required fields");
    }

    const { error } = await supabase
        .from("tasks")
        .insert([
            {
                title: task.title,
                description: task.description, 
                organization_id: task.organization_id,
                project_id: task.project_id,
                assignee_id: task.assignee_id,
                created_by: task.created_by,
                label: task.label,
                priority: task.priority,
                status: task.status,
            },
        ]);

    if (error) throw new Error(error.message);
};


export const fetchTasksForProject = async (projectId: string): Promise<Task[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tasks")
        .select("id, title, description, label, priority, status, assignee_id, created_by, created_at")
        .eq("project_id", projectId);

    if (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }

    return data as Task[];
};

export const fetchUsersInProject = async (projectId: string) => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from("project_members")
        .select("user_id, users!inner(id, name, avatar_url)")
        .eq("project_id", projectId);

    if (error) {
        console.error("❌ Error fetching users in project:", error);
        return [];
    }

    console.log("✅ Users in project (raw response):", data); // 🔥 Debugging log

    if (!Array.isArray(data)) {
        console.error("❌ Expected array but got:", data);
        return [];
    }

    return data.map((member) => {
        const user = Array.isArray(member.users) ? member.users[0] : member.users; // ✅ Handle array case

        return {
            id: user?.id || member.user_id, 
            name: user?.name || "Unknown",
            avatar: user?.avatar_url || "",
        };
    });
};
