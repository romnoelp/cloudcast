"use client";

import { ProjectListItemProps } from "@/types/project-list-item-props";
import { Button } from "@/components/ui/button";

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  deleteProject,
  archiveProject,
  activateProject,
}) => {
  return (
    <li key={project.id}>
      {project.name} - {project.description} - Status: {project.status}
      <Button size={"sm"} onClick={() => deleteProject(project.id)}>
        Delete
      </Button>
      {project.status === "archived" ? (
        <Button size={"sm"} onClick={() => activateProject(project.id)}>
          Activate
        </Button>
      ) : (
        <Button size={"sm"} onClick={() => archiveProject(project.id)}>
          Archive
        </Button>
      )}
    </li>
  );
};

export default ProjectListItem;
