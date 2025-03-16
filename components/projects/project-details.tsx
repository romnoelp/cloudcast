"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";

interface ProjectDetailsProps {
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
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
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
    </div>
  );
};

export default ProjectDetails;
