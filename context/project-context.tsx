"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project } from "@/types/project";
import { fetchProjectDetails } from "@/app/dashboard/projects/actions"; // Import fetch function

interface ProjectContextType {
  project: Project | null;
  setProjectId: (projectId: string | null) => void;
  setProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null); 
      return;
    }

    const loadProject = async () => {
      const data = await fetchProjectDetails(projectId);
      setProject(data);
    };

    loadProject();
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ project, setProjectId, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
