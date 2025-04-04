"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { Task } from "./(tasks)/task-type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksTable from "./(tasks)/task-table";
import {
  fetchProjectDetails,
  fetchTasksForProject,
  fetchUsersInProject,
} from "@/app/dashboard/projects/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import InboxPanel from "./(inbox)/inbox-panel";
import FileList from "./(files)/file-list";
import FilePreview from "./(files)/file-preview";
import FileSidebar from "./(files)/file-sidebar";

interface ProjectDetailsProps {
  projectId: string;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectId,
  onClose,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<
    { id: string; name: string; avatar: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const fetchTasksData = async () => {
    const updatedTasks = await fetchTasksForProject(projectId);
    setTasks(updatedTasks || []);
  };

  useEffect(() => {
    const getProjectData = async () => {
      setLoading(true);

      const projectData = await fetchProjectDetails(projectId);
      if (!projectData) {
        toast.error("Project not found.");
        setLoading(false);
        return;
      }

      setProject(projectData);

      const taskData = await fetchTasksForProject(projectId);
      setTasks(taskData || []);

      const userData = await fetchUsersInProject(projectId);
      setUsers(userData || []);

      setLoading(false);
    };

    getProjectData();
  }, [projectId]);

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <Avatar className="w-2 h-2">
            <AvatarFallback
              className={`text-xs font-medium uppercase ${
                project.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            ></AvatarFallback>
          </Avatar>
        </div>
        <Button onClick={onClose}>Back to List</Button>
      </div>

      <Tabs
        defaultValue="tasks"
        className="w-full flex flex-col flex-grow overflow-hidden"
      >
        <TabsList className="space-x-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <div className="flex-grow overflow-auto">
          <TabsContent value="tasks" className="h-full">
            <TasksTable
              tasks={tasks}
              projectId={projectId}
              orgId={project.organization_id}
              users={users}
              fetchTasksData={fetchTasksData}
            />
          </TabsContent>
          <TabsContent value="messages" className="flex flex-grow h-full">
            <InboxPanel />
          </TabsContent>
          <TabsContent value="files" className="h-full">
            <div className="flex h-full">
              <div className="w-1/7 pr-4">
                <FileSidebar />
              </div>
              <div className="flex-grow">
                <FileList />
              </div>
              <div className="w-1/3 pl-4">
                <FilePreview />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
