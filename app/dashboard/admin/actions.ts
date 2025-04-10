"use server";

import { createClient } from "@/lib/supabase/server";

// Function to get stats for an organization
export const fetchStats = async (organizationId: string) => {
  const supabase = await createClient();

  try {
    // Fetch active users in the organization
    const { data: users, error: userError } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("status", "active");

    if (userError) throw userError;

    const totalUsers = users ? users.length : 0;

    // Fetch projects within the organization
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", organizationId);

    if (projectError) throw projectError;

    const totalProjects = projects ? projects.length : 0;

    // Fetch files related to the organization's projects
    const { data: files, error: fileError } = await supabase
      .from("files")
      .select("id")
      .in("project_id", projects.map((project) => project.id));

    if (fileError) throw fileError;

    const totalFiles = files ? files.length : 0;

    // Fetch tasks in the organization
    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, label, status, priority, project_id")
      .in("project_id", projects.map((project) => project.id));

    if (taskError) throw taskError;

    const totalTasks = tasks ? tasks.length : 0;

    return {
      totalUsers,
      totalProjects,
      totalFiles,
      totalTasks,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

// Function to get all tasks in the organization
export const fetchAllTasks = async (organizationId: string) => {
  const supabase = await createClient();

  try {
    // Fetch projects within the organization
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", organizationId);

    if (projectError) throw projectError;

    // Fetch all tasks within the organization's projects
    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, label, status, priority, project_id")
      .in("project_id", projects.map((project) => project.id));

    if (taskError) throw taskError;

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Function to get all projects in the organization
export const fetchAllProjects = async (organizationId: string) => {
  const supabase = await createClient();

  try {
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("organization_id", organizationId);

    if (projectError) throw projectError;

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
