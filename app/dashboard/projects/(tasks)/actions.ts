"use server";

import { createClient } from "@/lib/supabase/server";
import { Task } from "./task-type";

export const deleteTask = async (taskId: string, projectId: string) => {
  const supabase = await createClient();

  console.log("Deleting task from Supabase:", { taskId, projectId }); 

  const { error } = await supabase
    .from("tasks")
    .delete()
    .match({ id: taskId, project_id: projectId });

  if (error) {
    console.error("Supabase delete error:", error); 
    throw new Error("Failed to delete task.");
  }

  console.log("Task deleted successfully!");
  return { success: true };
};

export const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    const supabase = await createClient();
  
    console.log("Updating task in Supabase:", { taskId, updatedData }); 
  
    const { error } = await supabase
      .from("tasks")
      .update(updatedData)
      .match({ id: taskId });
  
    if (error) {
      console.error("Supabase update error:", error); 
      throw new Error("Failed to update task.");
    }
  
    console.log("Task updated successfully!"); 
    return { success: true };
  };