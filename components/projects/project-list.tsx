"use client";

import { ProjectListProps } from "@/types/project-list-props";
import ProjectListItem from "./project-list-item";

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  deleteProject,
  archiveProject,
  activateProject,
}) => {
  return (
    <div className="flex flex-col p-8 pt-6 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Project List</h2>
      </div>
      <ul>
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            deleteProject={deleteProject}
            archiveProject={archiveProject}
            activateProject={activateProject}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
