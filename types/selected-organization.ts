export type Organization = {
    id: string;
    name: string;
    description: string;
    created_by: string;
};

export type OrganizationContextType = {
    selectedOrg: Organization | null;
    setSelectedOrg: (org: Organization | null) => void;
    organizations: Organization[];
    setOrganizations: (orgs: Organization[]) => void; 
    loading: boolean;
};
