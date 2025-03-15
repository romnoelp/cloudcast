export type Project = {
    id: string;
    name: string;
    description: string;
    organization_id: string;
    created_by: string;
    created_at: string;
    status: "active" | "archived" | string;
    members: number; 
};