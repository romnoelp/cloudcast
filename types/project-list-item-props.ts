import { Project } from "./project";

export type ProjectListItemProps = {
    project: Project;
    deleteProject: (projectId: string) => Promise<void>;
    archiveProject: (projectId: string) => Promise<void>;
    activateProject: (projectId: string) => Promise<void>;
};