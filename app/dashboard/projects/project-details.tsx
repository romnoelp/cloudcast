"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TasksTableMock from "../../../components/task/task-table";

interface ProjectDetailsProps {
  projectId: string;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onClose }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await response.json();
        setProject(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast.error("Failed to fetch project details.");
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <Card className="w-full h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
              </div>
            </CardTitle>
            <Button onClick={onClose}>Back to List</Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100% - 60px)]">
          <Tabs defaultValue="tasks" className="w-full h-full">
            <TabsList className="space-x-2"> {/* Add spacing between tabs */}
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="trash">Trash</TabsTrigger>
            </TabsList>
            <div className="h-full">
              <TabsContent value="tasks">
                <TasksTableMock />
              </TabsContent>
              <TabsContent value="inbox">
                <p>Inbox for {project.name} will be displayed here.</p>
                {/* Add inbox component or content here */}
              </TabsContent>
              <TabsContent value="sent">
                <p>Sent messages for {project.name} will be displayed here.</p>
                {/* Add sent messages component or content here */}
              </TabsContent>
              <TabsContent value="trash">
                <p>Trash for {project.name} will be displayed here.</p>
                {/* Add trash component or content here */}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;