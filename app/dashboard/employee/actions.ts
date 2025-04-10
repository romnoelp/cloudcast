"use server";

import { createClient } from "@/lib/supabase/server";

export type Task = {
  id: string;
  title: string;
  label: string;
  status: string;
  priority: string;
  project_id: string;
  project_name: string;
  created_at: string;
  assignee_id: string;
  projects: { name: string } | null;
};

export const fetchTasksForEmployee = async (
  organizationId: string,
  userId: string
): Promise<Task[]> => {
  const supabase = await createClient();

  try {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        label,
        status,
        priority,
        created_at,
        assignee_id,
        project_id,
        projects(name)
      `
      )
      .eq("organization_id", organizationId)
      .eq("assignee_id", userId);

    if (tasksError) {
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }

    const tasksWithProjectName: Task[] = tasks.map((task) => {
      const projectObj = Array.isArray(task.projects) ? task.projects[0] : task.projects;
      const projectName = projectObj?.name ?? "Unknown";

      return {
        ...task,
        project_name: projectName,
        projects: projectObj ?? null,
      };
    });

    return tasksWithProjectName;
  } catch (error) {
    console.error("Error fetching tasks for employee:", error);
    throw error;
  }
};
