"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchStats, fetchAllTasks, fetchAllProjects } from "../admin/actions";
import { useOrganization } from "@/context/organization-context";
import { DataTable } from "./data-table";

// Final shape expected by DataTable and your app
import type { Task } from "./data-table"; // <- use the same Task type from data-table.tsx

// Shape returned by the backend before we map it
type RawTask = {
  id: string;
  title: string;
  label: string;
  status: string;
  priority: string;
  project_id: string;
};

// Shape for Projects
type Project = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const { selectedOrg } = useOrganization();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalFiles: 0,
    totalTasks: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // State for projects

  useEffect(() => {
    if (!selectedOrg) return;

    const getStats = async () => {
      try {
        const data = await fetchStats(selectedOrg.id);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    const getAllProjects = async () => {
      try {
        const projectData: Project[] = await fetchAllProjects(selectedOrg.id);
        setProjects(projectData); // Set projects state
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    const getAllTasks = async () => {
      try {
        const taskData: RawTask[] = await fetchAllTasks(selectedOrg.id);

        // Map projects to a quick lookup by project_id
        const projectMap = projects.reduce((map, project) => {
          map[project.id] = project.name;
          return map;
        }, {} as Record<string, string>);

        // Map taskData and replace project_id with project name
        const mappedTasks: Task[] = taskData.map((task) => ({
          id: task.id,
          title: task.title,
          label: task.label,
          status: task.status,
          priority: task.priority,
          project_id: projectMap[task.project_id] || "Unknown Project", // Use project name
        }));
        setTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    getStats();
    getAllProjects();
    getAllTasks();
  }, [selectedOrg, projects]); // Trigger on projects change as well

  if (!selectedOrg) {
    return <div>Please select an organization first</div>;
  }

  return (
    <div className="flex flex-col p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            change: "+ 20 users since last month",
            status: "active",
          },
          {
            title: "Total Projects",
            value: stats.totalProjects,
            change: "+ 5 projects this month",
            status: "success",
          },
          {
            title: "Total Files",
            value: stats.totalFiles,
            change: "+ 56 files uploaded",
            status: "warning",
          },
          {
            title: "Total Tasks",
            value: stats.totalTasks,
            change: "+ 10 tasks added this week",
            status: "success",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Badge variant="default">{stat.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold">Tasks within the organization</h2>
        <DataTable data={tasks} />
      </div>
    </div>
  );
}
