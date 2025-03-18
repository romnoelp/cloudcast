"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksTableMock from "@/app/dashboard//projects/(tasks)/task-table";
import { fetchProjectDetails } from "@/app/dashboard/projects/actions";

interface ProjectDetailsProps {
  projectId: string;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectId,
  onClose,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProjectDetails = async () => {
      setLoading(true);
      const data = await fetchProjectDetails(projectId);
      if (!data) {
        toast.error("Project not found.");
      }
      setProject(data);
      setLoading(false);
    };

    getProjectDetails();
  }, [projectId]);

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-hidden">
      {/* ✅ The header stays fixed */}
      <div className="flex justify-between items-center pb-4">
        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
        <Button onClick={onClose}>Back to List</Button>
      </div>

      {/* ✅ Tabs fill available space */}
      <Tabs
        defaultValue="tasks"
        className="w-full flex flex-col flex-grow overflow-hidden"
      >
        <TabsList className="space-x-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        {/* ✅ This container will scroll instead of the entire page */}
        <div className="flex-grow overflow-auto">
          <TabsContent value="tasks" className="h-full">
            <TasksTableMock
              tasks={[]} // Replace with actual tasks fetched from the backend
              projectId={projectId}
              users={[]} // Replace with actual users in the project
              fetchTasksData={() => {}} // Replace with actual function to fetch tasks
            />
          </TabsContent>

          <TabsContent value="inbox" className="h-full">
            <p>Inbox for {project.name} will be displayed here.</p>
          </TabsContent>
          <TabsContent value="sent" className="h-full">
            <p>Sent messages for {project.name} will be displayed here.</p>
          </TabsContent>
          <TabsContent value="trash" className="h-full">
            <p>Trash for {project.name} will be displayed here.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
